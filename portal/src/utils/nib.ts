/**
 * NIB (Nomor Induk BAM) Utility Functions
 * Uses Luhn algorithm for checksum calculation
 */

/**
 * Calculate Luhn checksum for a NIB string
 */
export function calculateNibChecksum(nib: string): number {
    const digits = nib.split('').map(Number);
    let sum = 0;
    const length = digits.length;

    for (let i = 0; i < length; i++) {
        let digit = digits[length - 1 - i];

        // Double every second digit from right
        if (i % 2 === 1) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
    }

    return (10 - (sum % 10)) % 10;
}

/**
 * Add checksum to NIB
 */
export function nibWithChecksum(nib: string): string {
    if (!nib) return '';
    const checksum = calculateNibChecksum(nib);
    return nib + checksum;
}

/**
 * Validate NIB with checksum (last digit is checksum)
 */
export function validateNibChecksum(nibWithChecksum: string): boolean {
    if (nibWithChecksum.length < 3) return false;
    if (!/^\d+$/.test(nibWithChecksum)) return false;

    const nib = nibWithChecksum.slice(0, -1);
    const providedChecksum = parseInt(nibWithChecksum.slice(-1), 10);
    const expectedChecksum = calculateNibChecksum(nib);

    return providedChecksum === expectedChecksum;
}

/**
 * Format NIB for display with visual grouping
 * e.g., "08-03-10-04-000-8" or just adds checksum
 */
export function formatNibForDisplay(nib: string, withGrouping = false): string {
    if (!nib) return '-';

    const nibFull = nibWithChecksum(nib);

    if (!withGrouping) {
        return nibFull;
    }

    // Visual grouping: root-branch-sub...-status-checksum
    // 08-03-10-04-000-8
    const root = nibFull.slice(0, 2);
    const middle = nibFull.slice(2, -4); // everything between root and status+checksum
    const status = nibFull.slice(-4, -1);
    const checksum = nibFull.slice(-1);

    const middleParts = [];
    for (let i = 0; i < middle.length; i += 2) {
        middleParts.push(middle.slice(i, i + 2));
    }

    return [root, ...middleParts, status, checksum].join('-');
}
