// Pincode Storage Utility
export const PincodeStorage = {
    get: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('flashfit_pincode');
    },

    set: (pincode: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('flashfit_pincode', pincode);
    },

    clear: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('flashfit_pincode');
    }
};
