import * as z from "zod";

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(3, {message: "Minimum of 3 characters"}),
    accountId: z.string()
})

export const CoomentValidation = z.object({
    thread: z.string().nonempty().min(3, {message: "Minimum of 3 characters"}),
    accountId: z.string()
})