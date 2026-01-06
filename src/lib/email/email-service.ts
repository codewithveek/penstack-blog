import 'server-only'
import { db } from "@/db";
import { emailServiceConfig } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { decryptKey } from "@/lib/encryption";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export type EmailServiceType = "smtp" | "resend" | "sendgrid" | "mailgun" | "none";

export interface EmailConfig {
    serviceType: EmailServiceType;
    isActive: boolean;
    fromEmail: string;
    fromName: string;
    apiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
    smtpSecure?: boolean;
}

export interface SendEmailParams {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
}

let cachedConfig: EmailConfig | null = null;
let configLastFetched: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getEmailConfig(): Promise<EmailConfig | null> {
    const now = Date.now();

    if (cachedConfig && now - configLastFetched < CACHE_TTL) {
        return cachedConfig;
    }

    try {
        const [config] = await db
            .select()
            .from(emailServiceConfig)
            .where(eq(emailServiceConfig.is_active, true))
            .limit(1);

        if (!config) {
            cachedConfig = null;
            return null;
        }

        const emailConfig: EmailConfig = {
            serviceType: config.service_type as EmailServiceType,
            isActive: config.is_active,
            fromEmail: config.from_email,
            fromName: config.from_name,
        };

        if (config.service_type === "smtp") {
            emailConfig.smtpHost = config.smtp_host || undefined;
            emailConfig.smtpPort = config.smtp_port || undefined;
            emailConfig.smtpUser = config.smtp_user || undefined;
            emailConfig.smtpPassword = config.smtp_password
                ? decryptKey(config.smtp_password)
                : undefined;
            emailConfig.smtpSecure = config.smtp_secure || true;
        } else if (["resend", "sendgrid", "mailgun"].includes(config.service_type)) {
            emailConfig.apiKey = config.api_key ? decryptKey(config.api_key) : undefined;
        }

        cachedConfig = emailConfig;
        configLastFetched = now;
        return emailConfig;
    } catch (error) {
        console.error("Failed to fetch email config:", error);
        return null;
    }
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
    const config = await getEmailConfig();

    if (!config || !config.isActive) {
        console.warn("Email service not configured or inactive");
        return false;
    }

    try {
        switch (config.serviceType) {
            case "resend":
                return await sendViaResend(config, params);
            case "smtp":
                return await sendViaSMTP(config, params);
            case "sendgrid":
                return await sendViaSendGrid(config, params);
            case "mailgun":
                return await sendViaMailgun(config, params);
            default:
                console.warn("Unknown email service type:", config.serviceType);
                return false;
        }
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
}

async function sendViaResend(
    config: EmailConfig,
    params: SendEmailParams
): Promise<boolean> {
    if (!config.apiKey) {
        throw new Error("Resend API key not configured");
    }

    const resend = new Resend(config.apiKey);

    const { data, error } = await resend.emails.send({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: Array.isArray(params.to) ? params.to : [params.to],
        subject: params.subject,
        html: params.html,
        text: params.text,
        replyTo: params.replyTo,
    });

    if (error) {
        throw error;
    }

    return !!data;
}

async function sendViaSMTP(
    config: EmailConfig,
    params: SendEmailParams
): Promise<boolean> {
    if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword) {
        throw new Error("SMTP configuration incomplete");
    }

    const transporter = nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpSecure,
        auth: {
            user: config.smtpUser,
            pass: config.smtpPassword,
        },
    });

    const info = await transporter.sendMail({
        from: `"${config.fromName}" <${config.fromEmail}>`,
        to: Array.isArray(params.to) ? params.to.join(", ") : params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
        replyTo: params.replyTo,
    });

    return !!info.messageId;
}

async function sendViaSendGrid(
    config: EmailConfig,
    params: SendEmailParams
): Promise<boolean> {
    if (!config.apiKey) {
        throw new Error("SendGrid API key not configured");
    }

    // SendGrid implementation
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(config.apiKey);

    const msg = {
        to: params.to,
        from: {
            email: config.fromEmail,
            name: config.fromName,
        },
        subject: params.subject,
        text: params.text,
        html: params.html,
        replyTo: params.replyTo,
    };

    await sgMail.send(msg);
    return true;
}

async function sendViaMailgun(
    config: EmailConfig,
    params: SendEmailParams
): Promise<boolean> {
    if (!config.apiKey) {
        throw new Error("Mailgun API key not configured");
    }

    // Mailgun implementation would go here
    // This is a placeholder - you'd need to install and configure mailgun.js
    console.warn("Mailgun integration not yet implemented");
    return false;
}

export async function clearEmailConfigCache(): Promise<void> {
    cachedConfig = null;
    configLastFetched = 0;
}
