<?php

namespace App\Services;

use App\Models\Person;

/**
 * Service for NIB (Nomor Induk BAM) validation and management.
 * Uses Luhn algorithm for checksum validation.
 */
class NibService
{
    /**
     * Calculate Luhn checksum for NIB.
     * Uses the standard Luhn algorithm used by credit cards, IMEI, etc.
     */
    public static function calculateChecksum(string $nib): int
    {
        $digits = str_split($nib);
        $sum = 0;
        $length = count($digits);
        
        for ($i = 0; $i < $length; $i++) {
            $digit = (int) $digits[$length - 1 - $i];
            
            // Double every second digit from right
            if ($i % 2 === 1) {
                $digit *= 2;
                if ($digit > 9) {
                    $digit -= 9;
                }
            }
            
            $sum += $digit;
        }
        
        return (10 - ($sum % 10)) % 10;
    }
    
    /**
     * Generate NIB with checksum appended.
     */
    public static function withChecksum(string $nib): string
    {
        $checksum = self::calculateChecksum($nib);
        return $nib . $checksum;
    }
    
    /**
     * Validate NIB with checksum (last digit is checksum).
     */
    public static function validate(string $nibWithChecksum): bool
    {
        if (strlen($nibWithChecksum) < 3) {
            return false;
        }
        
        // Must be all digits
        if (!ctype_digit($nibWithChecksum)) {
            return false;
        }
        
        $nib = substr($nibWithChecksum, 0, -1);
        $providedChecksum = (int) substr($nibWithChecksum, -1);
        $expectedChecksum = self::calculateChecksum($nib);
        
        return $providedChecksum === $expectedChecksum;
    }
    
    /**
     * Extract original NIB (without checksum).
     */
    public static function extractNib(string $nibWithChecksum): ?string
    {
        if (!self::validate($nibWithChecksum)) {
            return null;
        }
        
        return substr($nibWithChecksum, 0, -1);
    }
    
    /**
     * Find person by NIB.
     */
    public static function findPersonByNib(string $nib): ?Person
    {
        return Person::where('nib', $nib)->first();
    }
    
    /**
     * Find person by NIB with checksum validation.
     */
    public static function findPersonByNibWithChecksum(string $nibWithChecksum): ?Person
    {
        $nib = self::extractNib($nibWithChecksum);
        
        if (!$nib) {
            return null;
        }
        
        return self::findPersonByNib($nib);
    }
    
    /**
     * Get NIB guide information for a given NIB.
     * Breaks down NIB into meaningful segments.
     */
    public static function parseNibSegments(string $nib): array
    {
        $segments = [];
        
        // Root (always 08)
        if (strlen($nib) >= 2) {
            $segments[] = [
                'value' => substr($nib, 0, 2),
                'label' => 'Root',
                'description' => 'Abdul Manan (Kode: 08)',
            ];
        }
        
        // Parse generation segments (each 2 digits between root and status)
        $remaining = substr($nib, 2);
        
        if (strlen($remaining) >= 3) {
            // Remove last 3 digits (status)
            $generationPart = substr($remaining, 0, -3);
            $statusPart = substr($remaining, -3);
            
            // Split into 2-digit segments
            $generationNumber = 1;
            for ($i = 0; $i < strlen($generationPart); $i += 2) {
                $segment = substr($generationPart, $i, 2);
                $generationNumber++;
                
                $segments[] = [
                    'value' => $segment,
                    'label' => self::getGenerationLabel($generationNumber),
                    'description' => 'Anak ke-' . intval($segment) . ' di generasi ' . $generationNumber,
                ];
            }
            
            // Status
            $segments[] = [
                'value' => $statusPart,
                'label' => 'Status',
                'description' => $statusPart === '000' 
                    ? 'Garis Darah' 
                    : 'Pasangan ke-' . intval($statusPart),
            ];
        }
        
        return $segments;
    }
    
    /**
     * Get generation label (anak, cucu, cicit, etc.)
     */
    public static function getGenerationLabel(int $generation): string
    {
        return match ($generation) {
            1 => 'Root',
            2 => 'Anak',
            3 => 'Cucu',
            4 => 'Cicit',
            5 => 'Canggah',
            6 => 'Wareng',
            7 => 'Udeg-udeg',
            8 => 'Gantung Siwur',
            default => 'Generasi ' . $generation,
        };
    }
    
    /**
     * Get generation label from root perspective.
     * Used when viewing family tree without personal context.
     */
    public static function getRelationshipFromRoot(Person $person): array
    {
        $generation = $person->generation;
        $label = self::getGenerationLabel($generation);
        
        // Suffix for spouse
        $isSpouse = $person->nib && !str_ends_with($person->nib, '000');
        
        if ($isSpouse) {
            $label = 'Pasangan ' . $label;
        }
        
        return [
            'generation' => $generation,
            'label' => $label,
            'label_short' => self::getGenerationLabel($generation),
            'is_spouse' => $isSpouse,
        ];
    }
}
