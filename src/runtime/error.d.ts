declare type TwirpResponse = Record<string, unknown>;
export interface TwirpError {
    code: string;
    msg: string;
    meta?: Record<string, string>;
}
interface TwirpIntermediaryError extends TwirpError {
    meta: {
        body: string;
        http_error_from_intermediary: "true";
        location?: string;
        status_code: string;
    };
}
export declare function isTwirpError<E extends TwirpResponse>(error: E): error is E & TwirpError;
export declare function isTwirpIntermediaryError<E extends TwirpResponse>(error: E): error is E & TwirpIntermediaryError;
export declare function twirpError(res: Response): Promise<TwirpError>;
export {};
