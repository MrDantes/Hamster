const games = {
    1: {
        name: 'Riding Extreme 3D',
        appToken: 'd28721be-fd2d-4b45-869e-9f253b554e50',
        promoId: '43e35910-c168-4634-ad4f-52fd764a843f',
    },
    2: {
        name: 'Chain Cube 2048',
        appToken: 'd1690a07-3780-4068-810f-9b5bbf2931b2',
        promoId: 'b4170868-cef0-424f-8eb9-be0622e8e8e3',
    },
    3: {
        name: 'My Clone Army',
        appToken: '74ee0b5b-775e-4bee-974f-63e7f4d5bacb',
        promoId: 'fe693b26-b342-4159-8808-15e3ff7f8767',
    },
    4: {
        name: 'Train Miner',
        appToken: '82647f43-3f87-402d-88dd-09a90025313f',
        promoId: 'c4480ac7-e178-4973-8061-9ed5b2e17954',
    },
    5: {
        name: 'Merge Away',
        appToken: '8d1cc2ad-e097-4b86-90ef-7a27e19fb833',
        promoId: 'dc128d28-c45b-411c-98ff-ac7726fbaea4',
    },
    6: {
        name: 'TwerkRace',
        appToken: '61308365-9d16-4040-8bb0-2f4a4c69074c',
        promoId: '61308365-9d16-4040-8bb0-2f4a4c69074c',
     },
     7 : {
        name: 'Polysphere',
        appToken: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        promoId: '2aaf5aee-2cbc-47ec-8a3f-0962cc14bc71',
        interval: 20,
        eventCount: 16,
    },
    8 : {
        name: 'Mow and Trim',
        appToken: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        promoId: 'ef319a80-949a-492e-8ee0-424fb5fc20a6',
        interval: 20,
        eventCount: 10,
    },
    9 : {
        name: 'Mud Racing',
        appToken: '8814a785-97fb-4177-9193-ca4180ff9da8',
        promoId: '8814a785-97fb-4177-9193-ca4180ff9da8',
        interval: 20,
        eventCount: 10,
    }
};

function generateClientId() {
    return crypto.randomUUID();
    //
    // const timestamp = Date.now();
    // const randomNumbers = [];
    //
    // for (let i = 0; i < 19; i++) {
    //     randomNumbers.push(Math.floor(Math.random() * 10));
    // }
    //
    // return `${timestamp}-${randomNumbers.join('')}`;
}


async function loginClient(gameNumber) {
    const clientId = generateClientId();
    const url = 'https://api.gamepromo.io/promo/login-client';

    const data = {
        appToken: games[gameNumber].appToken,
        clientId: clientId,
        clientOrigin: 'deviceid'
    };

    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.error_code === 'TooManyIpRequest') {
            console.log('Too many requests');
            await new Promise(resolve => setTimeout(resolve, 10000));
            return loginClient(gameNumber);
        }
        return result.clientToken;
    } catch (error) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return loginClient(gameNumber);
    }
}

async function registerEvent(token, gameNumber) {
    await new Promise(resolve => setTimeout(resolve, 20000));
    const eventId = generateRandomUUID();
    const url = 'https://api.gamepromo.io/promo/register-event';
    const data = {
        promoId: games[gameNumber].promoId,
        eventId: eventId,
        eventOrigin: 'undefined'
    };
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
    };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!result.hasCode) {
            console.log('Retry register event');
            return registerEvent(token, gameNumber);
        } else {
            return token;
        }
    } catch (error) {
        console.error('Fatal error:', error.message);
        await new Promise(resolve => setTimeout(resolve, 5000));
        let newToken = await loginClient(gameNumber);
        return registerEvent(newToken, gameNumber);
    }
}

async function createCode(token, gameNumber) {
    let response;
    do {
        try {
            await new Promise(resolve => setTimeout(resolve, 1000))
            const url = 'https://api.gamepromo.io/promo/create-code';

            const data = {
                promoId: games[gameNumber].promoId
            };

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json; charset=utf-8',
            };
            response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.promoCode) {
                return result.promoCode;
            }

        } catch (error) {
            console.error('Fatal error:', error.message);
        }
    } while (!response || !response.promoCode); // Повторяем запрос, если ничего не возвращает
}

function generateRandomUUID() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
        (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
}

const generateButton = document.getElementById('generateButton');
const generateTimeValue = document.getElementById('generate-time-value');
const generateProcessBlock = document.getElementById('process-generate-block');
let keyBlock = document.getElementById('keys-block');

async function generate() {
    generateButton.style.display = 'none';
    const games = document.getElementById('game-names-select');
    games.disabled = true;
    generateProcessBlock.style.display = 'flex';
    const endGenerateTime = Date.now() + 4 * 40 * 1000;

    const selectedGame = parseInt(games.value);

    keyBlock.style.display = 'none';

    generateTimeValue.innerText = '⏳';

    let generateTimeInterval = setInterval(() => startProcessGeneration(endGenerateTime), 1000);
    const codes = [];

    await new Promise(resolve => setTimeout(resolve, 5000));

    const tasks = [];

    for (let i = 0; i < 4; i++) {
        tasks.push((async (index) => {
            try {
                let token = await loginClient(selectedGame);
                let registerToken = await registerEvent(token, selectedGame);
                codes[index] = await createCode(registerToken, selectedGame);
            } catch (error) {
                codes[index] = `Error: ${error.message}`;
            }
        })(i));
    }

    await Promise.all(tasks);

    keyBlock.style.display = 'flex';

    for (let i = 0; i < 4; i++) {
        let keyValue = document.getElementById('keys-value-' + (i + 1));
        keyValue.innerText = codes[i];
    }

    generateButton.style.display = 'block';
    games.disabled = false;
    clearInterval(generateTimeInterval);
    generateProcessBlock.style.display = 'none';
    generateTimeValue.innerText = '👌';
    console.log(codes);
}

function startProcessGeneration(generationTime) {
    function updateProcessGenerationTime() {
        const now = new Date();
        const distance = generationTime - now.getTime();

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        generateTimeValue.innerText = '≈ ' +
            String(hours).padStart(2, '0') + ':' +
            String(minutes).padStart(2, '0') + ':' +
            String(seconds).padStart(2, '0');

        if (distance < 0) {
            generateTimeValue.innerText = "⏳";
        }
    }

    updateProcessGenerationTime();
}

generateButton.addEventListener('click', generate);
