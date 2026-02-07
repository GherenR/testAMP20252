import { z } from 'zod';
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema
} from './validation';

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;