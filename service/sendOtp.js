const axios = require('axios')

const sendOtp = async (phone, otp) => {

    let isSent = false;
    const url = 'https://api.managepoint.co/api/sms/send'

    const payload = {
        'apiKey': '963de891-a3f4-4999-9006-e7bd68352614',
        'to': phone,
        'message': `Your verification code is ${otp}`
    }

    try {
        const res = await axios.post(url, payload)
        if (res.status === 200) {
            isSent = true;
        }

    } catch (error) {
        console.log('Error Sending OTP', error.message)
    }

    return isSent;


}

module.exports = sendOtp;