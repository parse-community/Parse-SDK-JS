export type RelativeTimeToDateResult = {
    /**
     * The conversion status, `error` if conversion failed or
     * `success` if conversion succeeded.
     */
    status: string;
    /**
     * The error message if conversion failed, or the relative
     * time indication (`past`, `present`, `future`) if conversion succeeded.
     */
    info: string;
    /**
     * The converted date, or `undefined` if conversion
     * failed.
     */
    result: Date | undefined;
};
