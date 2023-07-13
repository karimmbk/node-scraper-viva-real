export class LogTimeUtil {
    private startTime: Date;

    constructor() {
        this.startTime = new Date()
    }

    getElapsedTime(): number {
        return (new Date().getTime() - this.startTime.getTime()) / 1000;
    }
}
