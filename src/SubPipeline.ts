import { Pipeline } from "./Pipeline";

/**
 * Sub pipeline
 *
 * The "sub-pipeline"" is a pipeline which can run as part of a stage (e.g. the filter stage) in the "main" pipeline.
 * Stages can be piped onto the sub pipeline and when the pipeline run's it will hand control back to the "main"
 * pipeline once it completes its "up" process. When the next stage in the "main" pipeline resolves, this
 * "sub-pipeline" will resume with its "down" process.
 *
 * If the next stage of the main (parent) pipeline is not set before the pipeline has completed it's "up" process, the
 * pipeline will resolve the "up" process like any other and immediatly continue with its down process.
 *
 * @package j-stillery/SubPipeline
 * @author Sandhjé Bouw (sandhje@ecodes.io)
 */
class SubPipeline<T> extends Pipeline<T> {
    /**
     * Callback to trigger the next stage in the "main" pipeline
     *
     * @callback (input: T): Promise<T>
     */
    private parentNext: (input: T) => Promise<T>;

    /**
     * Parent next setter
     *
     * @param function parentNext
     * @returns void
     */
    public setParentNext(parentNext: (input: T) => Promise<T>): void {
        this.parentNext = parentNext;
    }

    /**
     * End override
     *
     * Override for the pipeline's end method. Allows to hand control back to the "main" pipeline once this "sub"
     * pipeline completes its "up" process. Once the next stage in the "main" pipeline resolves the "down" process
     * in this "sub" pipeline is executed.
     *
     * @param T input
     * @param function resolve
     * @param function reject
     */
    protected end(input: T, resolve: (value?: T | PromiseLike<T>) => void, reject: (reason: any) => void): void {
        if (typeof this.parentNext !== "function") {
            resolve(input);
        }

        // On end of the "filter" pipeline, continue with parent
        // Once parent comes back, continue back down the "filter"
        this.parentNext(input).then((output: T) => {
            resolve(output);
        }).catch((reason: any) => {
            reject(reason);
        });
    }
}

export { SubPipeline };
