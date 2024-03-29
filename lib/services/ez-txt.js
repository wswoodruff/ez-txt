'use strict';

const Schmervice = require('schmervice');
const Twilio = require('twilio');

const DEFAULT_NUMBER_FILTER = (phoneNum) => phoneNum.capabilities.SMS;

// Docs: https://www.twilio.com/docs/sms/services/api

const internals = {};

module.exports = class EzTxt extends Schmervice.Service {

    constructor(server, options) {

        super(server, options);

        if (!this.options.twilio ||
            !this.options.twilio.account) {

            throw new Error('options.twilio.account is required');
        }
    }

    async initialize() {

        const { accountSid, authToken } = this.options.twilio.account;

        this.client = await Twilio(accountSid, authToken);
    }

    async getDefaultOrRandomNumber() {

        if (this.options.twilio.defaultNumber) {

            return this.options.twilio.defaultNumber;
        }

        const { phoneNumber } = internals.sample(await this.listPurchasedNumbers());

        return phoneNumber;
    }

    async listAvailableNumbers(areaCode) {

        if (!areaCode) {
            throw Error('"areaCode" is required');
        }

        const numbers = await this.client
            .availablePhoneNumbers('US')
            .local
            .list({
                areaCode,
                voiceEnabled: true,
                smsEnabled: true,
                mmsEnabled: true
            });

        return numbers.filter(DEFAULT_NUMBER_FILTER);
    }

    // Docs: https://www.twilio.com/docs/sms/services/api/phonenumber-resource#create-a-phonenumber-resource
    async purchaseNumber(number) {

        const purchasedNumber = await this.client
            .incomingPhoneNumbers
            .create({ phoneNumber: number });

        return purchasedNumber;
    }

    // Docs: https://www.twilio.com/docs/phone-numbers/api/incomingphonenumber-resource?code-sample=code-list-all-incomingphonenumber-resources-for-your-account&code-language=node.js&code-sdk-version=3.x
    async listPurchasedNumbers() {

        return await this.client.incomingPhoneNumbers.list();
    }

    // Docs: https://www.twilio.com/docs/sms/send-messages
    async txt({ from, to, body, mediaUrl, statusListenerId }) {

        await this.client
            .messages
            .create({
                from,
                to,
                body,
                mediaUrl,
                statusCallback: statusListenerId && `${this.options.statusServerUrl}/status/${statusListenerId}`
            });
    }

    async onTxtBack({ payload }) {

        const {
            lead,
            secondary
        } = this.options.admins;

        // const adminNumbers = Object.keys(this.options.admins).map(() => {

        //     //
        // });

        const from = await this.getDefaultOrRandomNumber();

        await console.log('payload', payload);

        await this.txt({ from, to: lead, body: JSON.stringify(payload, null, 4) });
    }
};

internals.sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Returns a string
internals.ensureCountryCode = (number) => {

    if (String(number).startsWith('+1')) {

        return number;
    }

    return `+1${String(number)}`;
};
