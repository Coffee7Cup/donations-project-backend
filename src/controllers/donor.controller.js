import axios from "axios";

const verifyPayment = async (req, res) => {

  const BASE_URL = process.env.INSTAMOJO_BASE_URL || "https://api.instamojo.com/v2/";

 
  const { payment_request_id, payment_id } = req.query;

   if (!payment_request_id || !payment_id) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  try {
    const response = await axios.get(
      `${BASE_URL}payment-requests/${payment_request_id}/${payment_id}/`,
      {
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_API_KEY,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    if (response.data.payment_request.payment.status === "Credit") {
      // Save the user to DB or issue a JWT token
      return res.json({
        success: true,
        donorType: "mega", // or whatever logic you use to classify
        email: response.data.payment_request.payment.email,
      });
    }

    return res.status(400).json({ success: false, message: "Payment not credited" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};


export {verifyPayment}