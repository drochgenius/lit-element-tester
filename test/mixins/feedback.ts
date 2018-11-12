export enum FeedbackType {
    negative = 'negative',
    neutral = 'neutral',
    positive = 'positive'
}

export class Feedback {
    public getFeedback(value: number): FeedbackType {
        if (value > 0) {
            return FeedbackType.positive;
        } else if (value === 0) {
            return FeedbackType.neutral;
        }
        return FeedbackType.negative;
    }
}
