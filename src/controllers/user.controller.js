import { Cashfree, CFEnvironment } from "cashfree-pg";
import axios from "axios";

const createOrder = async (req, res) => {};

const donateCashFree = async (req, res) => {
  const { name, email, phone, amount, message } = req.body;

  try {
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders", // or production
      {
        order_amount: Number(amount),
        order_currency: "INR",
        customer_details: {
          customer_id: email, // or any unique ID
          customer_email: email,
          customer_phone: phone,
          customer_name: name,
        },
        order_meta: {
          return_url: "http://localhost:3000/thank-you", // optional
          notify_url: "https://yourserver.com/webhook", // optional
        },
        order_note: message || "", // optional message
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2022-09-01",
          "x-client-id": YOUR_CLIENT_ID,
          "x-client-secret": YOUR_CLIENT_SECRET,
        },
      }
    );

    res.json({ paymentSessionId: response.data.payment_session_id });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Payment initialization failed." });
  }
};

const confirmDonationCashFree = async (req, res) => {
  const { order_id } = req.query;

  try {
    const cashfree = new Cashfree(
      CFEnvironment.TEST,
      "YOUR_CLIENT_ID",
      "YOUR_CLIENT_SECRET"
    );

    const response = await cashfree.PGFetchOrder(order_id);
    return res.json(response.data);
  } catch (err) {
    console.error("Error confirming donation:", err.response?.data || err);
    return res.status(500).json({
      success: false,
      message: "Error confirming donation",
    });
  }
};

const createOrderInstaMojo = async (req, res) => {
  try {
    const { name, email, phone, amount, purpose } = req.body;

    const response = await axios.post(
      `${process.env.INSTAMOJO_BASE_URL}payment-requests/`,
      {
        purpose: purpose || "Test Payment",
        amount: amount || "100",
        buyer_name: name,
        email,
        phone,
        redirect_url: "/donation-project-frontend/after-payment-page",//this url is showed even if the users cancles the payment BUT this url will get payment id etc
        send_email: true,
        send_sms: true,
        allow_repeated_payments: false,
      },
      {
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_API_KEY,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    const longUrl = response.data.payment_request.longurl;
    res.json({ paymentUrl: longUrl });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ error: "Failed to create payment" });
  }
}

  


export { donateCashFree, confirmDonationCashFree, createOrderInstaMojo };
