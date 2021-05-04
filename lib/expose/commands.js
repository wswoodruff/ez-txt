'use strict';

const Wreck = require('@hapi/wreck');

const DEFAULT_AREA_CODE = '213'; // Some California area code

const internals = {};

// const SLOW_MSG_MIN_WAIT = 10000;
// const SLOW_MSG_MAX_WAIT = 20000;

const SLOW_MSG_MIN_WAIT = 100;
const SLOW_MSG_MAX_WAIT = 200;

module.exports = (server, options) => ({
    value: {
        default: {
            description: '[to, msg, mediaUrl]',
            command: async (srv, [to, msg, mediaUrl]) => {

                await internals.sendText({
                    srv,
                    to,
                    msg,
                    mediaUrl,
                    options
                });
            }
        },
        from: {
            description: '[to, from, msg, mediaUrl]',
            command: async (srv, [to, from, msg, mediaUrl]) => {

                await internals.sendText({
                    srv,
                    to,
                    from,
                    msg,
                    mediaUrl,
                    options
                });
            }
        },
        christmasGreeting: {
            description: '[to] Merry Christmas Suckaaas!',
            command: async (srv, [to]) => {

                const blastMsg1 = 'Merry Christmaaaaaaaaaas!!! Cheers to you and yours on this special day!!!';
                const blastMsg2 = 'https://swervy.io/code/sry-not-sry-more-compressed';
                const splitMsg = 'Merry Christmas my good friend!';

                let numNumbers = 5;

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available. Using ${numbers.length} numbers.`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                // Blast 'em w/ the initial greeting
                await Promise.all(numbers.map(({ phoneNumber }) => {

                    return internals.sendText({
                        srv,
                        to,
                        from: phoneNumber,
                        msg: blastMsg1,
                        // mediaUrl,
                        options
                    });
                }));

                // Wait...
                await internals.awaitTimeout(20000);

                // Blast 'em with the pic
                await Promise.all(numbers.map(({ phoneNumber }) => {

                    return internals.sendText({
                        srv,
                        to,
                        from: phoneNumber,
                        msg: '#srynotsry',
                        mediaUrl: blastMsg2,
                        options
                    });
                }));

                // Wait 20 seconds for the MMS to be delivered...
                await internals.awaitTimeout(30000);

                // Time for the split message (reversed)
                // Reverse
                const messageSlices = splitMsg.split(' ').reverse();

                for (let i = 0; i < messageSlices.length; ++i) {

                    await internals.sendText({
                        srv,
                        to,
                        from: numbers[i] && numbers[i].phoneNumber,
                        msg: messageSlices[i],
                        // mediaUrl,
                        options
                    });

                    // Wait if it's not the last one
                    if (i < messageSlices.length - 1) {
                        await internals.awaitTimeout(Math.floor(Math.random() * SLOW_MSG_MAX_WAIT) + SLOW_MSG_MIN_WAIT);
                    }
                }
            }
        },
        blastTxt: {
            description: '[to, numNumbers, msg, mediaUrl]',
            command: async (srv, [to, numNumbers, msg, mediaUrl]) => {

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                await Promise.all(numbers.map(({ phoneNumber }) => {

                    return internals.sendText({
                        srv,
                        to,
                        from: phoneNumber,
                        msg,
                        mediaUrl,
                        options
                    });
                }));
            }
        },
        slowSplit: {
            description: '[to, numNumbers, msg, mediaUrl]',
            command: async (srv, [to, numNumbers, msg, mediaUrl]) => {

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                // Idk man just found this on Stack Overflow
                const sliceLength = Math.round(msg.length / numbers.length);
                const matchRegexp = new RegExp(`.{1,${sliceLength}}`, 'g');

                const messageSlices = msg.match(matchRegexp);

                for (let i = 0; i < messageSlices.length; ++i) {

                    await internals.sendText({
                        srv,
                        to,
                        from: numbers[i].phoneNumber,
                        msg: messageSlices[i],
                        mediaUrl,
                        options
                    });

                    // Wait if it's not the last one
                    if (i < messageSlices.length - 1) {
                        await internals.awaitTimeout(Math.floor(Math.random() * SLOW_MSG_MAX_WAIT) + SLOW_MSG_MIN_WAIT);
                    }
                }
            }
        },
        slowSplitReverse: {
            description: '[to, numNumbers, msg, mediaUrl]',
            command: async (srv, [to, numNumbers, msg, mediaUrl]) => {

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                // Idk man just found this on Stack Overflow
                const sliceLength = Math.round(msg.length / numbers.length);
                const matchRegexp = new RegExp(`.{1,${sliceLength}}`, 'g');

                const messageSlices = msg.match(matchRegexp).reverse();

                for (let i = 0; i < messageSlices.length; ++i) {

                    await internals.sendText({
                        srv,
                        to,
                        from: numbers[i] && numbers[i].phoneNumber,
                        msg: messageSlices[i],
                        mediaUrl,
                        options
                    });

                    // Wait if it's not the last one
                    if (i < messageSlices.length - 1) {
                        await internals.awaitTimeout(Math.floor(Math.random() * SLOW_MSG_MAX_WAIT) + SLOW_MSG_MIN_WAIT);
                    }
                }
            }
        },
        slowSplitWord: {
            description: '[to, numNumbers, msg, mediaUrl]',
            command: async (srv, [to, numNumbers, msg, mediaUrl]) => {

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                // Reverse
                const messageSlices = msg.split(' ');

                for (let i = 0; i < messageSlices.length; ++i) {

                    await internals.sendText({
                        srv,
                        to,
                        from: numbers[i] && numbers[i].phoneNumber,
                        msg: messageSlices[i],
                        mediaUrl,
                        options
                    });

                    // Wait if it's not the last one
                    if (i < messageSlices.length - 1) {
                        await internals.awaitTimeout(Math.floor(Math.random() * SLOW_MSG_MAX_WAIT) + SLOW_MSG_MIN_WAIT);
                    }
                }
            }
        },
        slowSplitWordReverse: {
            description: '[to, numNumbers, msg, mediaUrl]',
            command: async (srv, [to, numNumbers, msg, mediaUrl]) => {

                let numbers = await internals.listPurchasedNumbers(srv);

                numNumbers = Math.max(parseInt(numNumbers, 10), 1);

                if (numNumbers > numbers.length) {
                    console.warn(`Requested numbers are ${numNumbers} but there are only ${numbers.length} available`);
                }

                // Slice to be length 1 up to numbers.length
                numbers = numbers.slice((Math.min(Math.max(numNumbers, 0), numbers.length)) * -1);

                // Reverse
                const messageSlices = msg.split(' ').reverse();

                for (let i = 0; i < messageSlices.length; ++i) {

                    await internals.sendText({
                        srv,
                        to,
                        from: numbers[i] && numbers[i].phoneNumber,
                        msg: messageSlices[i],
                        mediaUrl,
                        options
                    });

                    // Wait if it's not the last one
                    if (i < messageSlices.length - 1) {
                        await internals.awaitTimeout(Math.floor(Math.random() * SLOW_MSG_MAX_WAIT) + SLOW_MSG_MIN_WAIT);
                    }
                }
            }
        },
        listAvailableNumbers: {
            description: '[areaCode]',
            command: async (srv, [areaCode]) => {

                areaCode = areaCode || DEFAULT_AREA_CODE;

                const { ezTxt } = srv.services();

                console.log(await ezTxt.listAvailableNumbers(areaCode));
            }
        },
        purchaseNumber: {
            description: '[number]',
            command: async (srv, [number]) => {

                if (!number) {
                    throw new Error('"number" is required');
                }

                const { ezTxt } = srv.services();

                console.log(await ezTxt.purchaseNumber(number));
            }
        },
        purchaseRandomFromAreaCode: {
            description: '[areaCode]',
            command: async (srv, [areaCode]) => {

                areaCode = areaCode || DEFAULT_AREA_CODE;

                const { ezTxt } = srv.services();

                const availableNumbers = await ezTxt.listAvailableNumbers(areaCode);

                if (!availableNumbers.length) {
                    throw new Error(`No numbers available for area code ${areaCode}`);
                }

                const { phoneNumber } = internals.sample(availableNumbers);

                console.log(await ezTxt.purchaseNumber(phoneNumber));
            }
        },
        listPurchasedNumbers: {
            command: async (srv) => {

                const numbers = await internals.listPurchasedNumbers(srv);

                console.log('numbers', numbers);
            }
        },
        sseTest: {
            command: async (srv) => {

                if (!options.statusServerUrl) {
                    throw new Error('options.statusServerUrl is required');
                }

                const { ezSse } = srv.services();
                const { awaitTimeout } = internals;

                const TEST_SESSION_ID = '123456789';

                const runTestCommands = async () => {

                    // Allow SSE listener to start
                    await awaitTimeout(3000);

                    await Wreck.request('post', `${options.statusServerUrl}/status/${TEST_SESSION_ID}`, {
                        payload: JSON.stringify({
                            SmsSid: '1234567890',
                            SmsStatus: 'sent',
                            MessageStatus: 'sent',
                            To: '9876543210',
                            MessageSid: '12345678901234567890',
                            AccountSid: '12345678901234567890',
                            From: '3383727728',
                            ApiVersion: '123'
                        })
                    });

                    await awaitTimeout(3000);

                    await Wreck.request('post', `${options.statusServerUrl}/status/${TEST_SESSION_ID}`, {
                        payload: JSON.stringify({
                            SmsSid: '1234567890',
                            SmsStatus: 'delivered',
                            MessageStatus: 'delivered',
                            To: '9876543210',
                            MessageSid: '12345678901234567890',
                            AccountSid: '12345678901234567890',
                            From: '3383727728',
                            ApiVersion: '123'
                        })
                    });
                };

                runTestCommands();

                await ezSse.listen({
                    url: `${options.statusServerUrl}/status/${TEST_SESSION_ID}`,
                    events: {
                        status: (evt) => console.log(evt)
                    },
                    onOpen: () => console.log('SSE connection opened.'),
                    onClose: () => console.log('SSE connection closed.'),
                    onError: (err) => console.log('Error (logging in sseTest command code)\n', err)
                });

                console.log('\nTest complete.\n');
            }
        }
    }
});

internals.sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

internals.awaitTimeout = async (timeout) => {

    return await new Promise((res) => {

        setTimeout(res, timeout);
    });
};

internals.listPurchasedNumbers = async (srv) => {

    const { ezTxt } = srv.services();

    return await ezTxt.listPurchasedNumbers();
};

internals.sendText = async ({ srv, to, from, msg, mediaUrl, options }) => {

    if (!to || (!msg && !mediaUrl)) {
        throw new Error('"to", and ("msg" or "mediaUrl") are required');
    }

    if (String(msg).startsWith('http')) {
        mediaUrl = msg;
        msg = undefined;
    }

    if (mediaUrl && !String(mediaUrl).startsWith('http')) {
        throw new Error('"mediaUrl" must be a URL');
    }

    const { ezSse, ezTxt } = srv.services();

    const statusListenerId = String(Math.random()).slice(2);
    let ssePromise;

    if (options.statusServerUrl) {

        ssePromise = ezSse.listen({
            url: `${options.statusServerUrl}/status/${statusListenerId}`,
            events: {
                status: (evt) => {

                    try {
                        const data = JSON.parse(evt.data);
                        console.log(data.MessageStatus);
                    }
                    catch (err) {
                        console.log('Error parsing event.data');
                        console.log(err);
                    }
                }
            },
            onOpen: () => console.log('SSE connection opened.\n'),
            onClose: () => console.log('\nSSE connection closed.'),
            onError: (err) => console.log(err)
        });
    }

    const phoneNumber = from || await ezTxt.getDefaultOrRandomNumber();

    // Send the text _after_ we start listening for status updates,
    // if a statusServerUrl is available
    await ezTxt.txt({
        from: phoneNumber,
        to,
        body: msg,
        mediaUrl,
        statusListenerId
    });

    if (ssePromise) {
        await ssePromise;
    }
};
