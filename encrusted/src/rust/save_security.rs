use crc::{Crc, CRC_32_ISCSI};
use hmac::{Hmac, Mac};
use sha2::Sha256;

type HmacSha256 = Hmac<Sha256>;

#[derive(Debug)]
pub struct SaveFileHeader {
    pub version: u8,
    pub crc32: u32,
    pub hmac: [u8; 32],
}

pub struct SaveValidator;

impl SaveValidator {
    pub fn add_security_info(data: &[u8], secret_key: &[u8; 32]) -> Vec<u8> {
        let mut result = Vec::new();

        result.push(1);

        let crc = Crc::<u32>::new(&CRC_32_ISCSI);
        let crc_value = crc.checksum(data);
        result.extend_from_slice(&crc_value.to_le_bytes());

        let mut mac = HmacSha256::new_from_slice(secret_key)
            .expect("HMAC can take key of any size");
        mac.update(data);
        let hmac_result = mac.finalize();
        result.extend_from_slice(&hmac_result.into_bytes());

        result.extend_from_slice(data);
        result
    }

    pub fn validate_and_extract(
        data: &[u8],
        secret_key: &[u8; 32],
    ) -> Result<Vec<u8>, String> {
        if data.len() < 37 {
            return Err("Save file too short (minimum 37 bytes for security header)".to_string());
        }

        let version = data[0];
        if version != 1 {
            return Err(format!(
                "Unsupported save file version: {}",
                version
            ));
        }

        let stored_crc = u32::from_le_bytes([data[1], data[2], data[3], data[4]]);

        let mut stored_hmac = [0u8; 32];
        stored_hmac.copy_from_slice(&data[5..37]);

        let payload = &data[37..];

        let crc = Crc::<u32>::new(&CRC_32_ISCSI);
        let computed_crc = crc.checksum(payload);
        if stored_crc != computed_crc {
            return Err(format!(
                "CRC32 mismatch: expected {:#x}, got {:#x}",
                stored_crc, computed_crc
            ));
        }

        let mut mac = HmacSha256::new_from_slice(secret_key)
            .expect("HMAC can take key of any size");
        mac.update(payload);
        let computed_hmac = mac.finalize();

        if &computed_hmac.into_bytes()[..] != stored_hmac {
            return Err("HMAC-SHA256 signature verification failed".to_string());
        }

        Ok(payload.to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_and_validate_security_info() {
        let secret_key = [42u8; 32];
        let test_data = b"test save state data";

        let secured = SaveValidator::add_security_info(test_data, &secret_key);

        let result = SaveValidator::validate_and_extract(&secured, &secret_key);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), test_data);
    }

    #[test]
    fn test_invalid_hmac() {
        let secret_key = [42u8; 32];
        let wrong_key = [43u8; 32];
        let test_data = b"test save state data";

        let secured = SaveValidator::add_security_info(test_data, &secret_key);

        let result = SaveValidator::validate_and_extract(&secured, &wrong_key);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("HMAC"));
    }

    #[test]
    fn test_corrupted_crc() {
        let secret_key = [42u8; 32];
        let test_data = b"test save state data";

        let mut secured = SaveValidator::add_security_info(test_data, &secret_key);

        if secured.len() > 40 {
            secured[40] ^= 0xFF;
        }

        let result = SaveValidator::validate_and_extract(&secured, &secret_key);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("CRC32"));
    }

    #[test]
    fn test_truncated_file() {
        let secret_key = [42u8; 32];
        let truncated = vec![1u8, 2, 3, 4, 5];

        let result = SaveValidator::validate_and_extract(&truncated, &secret_key);
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("too short"));
    }
}
