import { Cashfree, CFEnvironment } from "cashfree-pg";
import axios from "axios";

const createOrder = async (req, res) => {};

const donate = async (req, res) => {
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

const confirmDonation = async (req, res) => {
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

export { donate, confirmDonation };
