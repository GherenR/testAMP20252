import prisma from './prisma';
import { hashPassword, comparePassword } from './password';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from './validation';
import { generateResetToken, hashToken } from './resetToken';


// Signup logic
import { SignupInput } from './types';
export async function signup(data: SignupInput) {
    const parsed = signupSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.format() };

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: 'Email already registered' };

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
        data: { name, email, password: hashed },
    });
    return { user };
}

// Login logic
import { LoginInput } from './types';
export async function login(data: LoginInput) {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.format() };

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'Invalid credentials' };

    const valid = await comparePassword(password, user.password);
    if (!valid) return { error: 'Invalid credentials' };

    return { user };
}

// Forgot password logic
import { ForgotPasswordInput } from './types';
export async function forgotPassword(data: ForgotPasswordInput) {
    const parsed = forgotPasswordSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.format() };

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: 'Email not found' };

    const token = generateResetToken();
    const hashedToken = hashToken(token);
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
        where: { email },
        data: { resetToken: hashedToken, resetTokenExpiry: expiry },
    });

    // Simulate sending email
    return { message: 'Reset link sent', token };
}

// Reset password logic
import { ResetPasswordInput } from './types';
export async function resetPassword(data: ResetPasswordInput) {
    const parsed = resetPasswordSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.format() };

    const { token, password } = parsed.data;
    const hashedToken = hashToken(token);
    const user = await prisma.user.findFirst({
        where: {
            resetToken: hashedToken,
            resetTokenExpiry: { gt: new Date() },
        },
    });
    if (!user) return { error: 'Invalid or expired token' };

    const hashed = await hashPassword(password);
    await prisma.user.update({
        where: { id: user.id },
        data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });

    return { message: 'Password reset successful' };
}
