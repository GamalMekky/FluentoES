export interface AudioRecordResult {
  base64Audio: string;
  mimeType: string;
  audioBlob: Blob;
  durationSeconds: number;
}

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private startTime: number = 0;
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Try formats compatible with modern browsers
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else {
          mimeType = '';
        }
      }

      const options = mimeType ? { mimeType } : undefined;
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.startTime = Date.now();
      this.mediaRecorder.start(100);
    } catch (err: any) {
      console.error('Microphone access failed:', err);
      throw new Error(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'برجاء السماح بالوصول إلى الميكروفون لتسجيل ونطق الإسبانية.'
          : 'تعذر تشغيل مسجل الصوت، تأكد من سلامة الميكروفون.'
      );
    }
  }

  stop(): Promise<AudioRecordResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('المسجل لم يبدأ بعد'));
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });

        // Stop all media tracks to release the mic light
        if (this.stream) {
          this.stream.getTracks().forEach((track) => track.stop());
          this.stream = null;
        }

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const dataUrl = reader.result as string;
            // Extract the pure base64 part
            const base64Audio = dataUrl.split(',')[1] || '';
            resolve({
              base64Audio,
              mimeType,
              audioBlob,
              durationSeconds,
            });
          };
          reader.onerror = (e) => reject(e);
        } catch (e) {
          reject(e);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}
