const Core = require('@alicloud/pop-core');
const crypto = require('crypto');

// 存储验证码和发送时间
const verificationCodes = new Map();

class SmsService {
    constructor() {
        this.client = new Core({
            accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
            accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
            endpoint: 'https://dysmsapi.aliyuncs.com',
            apiVersion: '2017-05-25'
        });
    }

    // 生成6位随机验证码
    generateVerificationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // 发送验证码
    async sendVerificationCode(phoneNumber) {
        // 检查是否在一分钟内重复发送
        const existingCode = verificationCodes.get(phoneNumber);
        if (existingCode && (Date.now() - existingCode.timestamp) < 60000) {
            throw new Error('请等待60秒后再次获取验证码');
        }

        const code = this.generateVerificationCode();
        const params = {
            RegionId: "cn-hangzhou",
            PhoneNumbers: phoneNumber,
            SignName: process.env.ALIYUN_SMS_SIGN_NAME,
            TemplateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE,
            TemplateParam: JSON.stringify({ code })
        };

        try {
            const result = await this.client.request('SendSms', params, { method: 'POST' });
            if (result.Code === 'OK') {
                // 存储验证码和发送时间
                verificationCodes.set(phoneNumber, {
                    code,
                    timestamp: Date.now()
                });
                return true;
            }
            throw new Error(result.Message);
        } catch (error) {
            console.error('发送短信失败:', error);
            throw error;
        }
    }

    // 验证验证码
    verifyCode(phoneNumber, code) {
        const storedData = verificationCodes.get(phoneNumber);
        if (!storedData) {
            return false;
        }

        // 验证码5分钟内有效
        if (Date.now() - storedData.timestamp > 300000) {
            verificationCodes.delete(phoneNumber);
            return false;
        }

        const isValid = storedData.code === code;
        if (isValid) {
            verificationCodes.delete(phoneNumber); // 使用后删除验证码
        }
        return isValid;
    }

    // 清理过期的验证码
    cleanupExpiredCodes() {
        const now = Date.now();
        for (const [phoneNumber, data] of verificationCodes.entries()) {
            if (now - data.timestamp > 300000) { // 5分钟后过期
                verificationCodes.delete(phoneNumber);
            }
        }
    }
}

// 每分钟清理一次过期的验证码
setInterval(() => {
    const smsService = new SmsService();
    smsService.cleanupExpiredCodes();
}, 60000);

module.exports = new SmsService(); 