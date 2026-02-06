/**
 * Generate WhatsApp message template with dynamic values
 */
export const generateWhatsAppMessage = (
    mentorName: string,
    studentName: string,
    studentClass: string,
    studentBatch: number
): string => {
    const getGreeting = (): string => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return 'Pagi';
        if (hour >= 11 && hour < 15) return 'Siang';
        if (hour >= 15 && hour < 19) return 'Sore';
        return 'Malam';
    };

    const waktu = getGreeting();

    const message = `Selamat ${waktu} Kak ${mentorName}, saya ${studentName} dari kelas ${studentClass} angkatan ${studentBatch}. Ingin berkonsultasi mengenai perkuliahan. Apakah ada waktu luang untuk berdiskusi sebentar? Terima kasih Kak!`;

    return message;
};

/**
 * Encode message for WhatsApp URL
 */
export const encodeWhatsAppMessage = (message: string): string => {
    return encodeURIComponent(message);
};

/**
 * Generate WhatsApp link with pre-filled message
 */
export const generateWhatsAppLink = (
    phoneNumber: string,
    message: string
): string => {
    const encodedMessage = encodeWhatsAppMessage(message);
    return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
};
