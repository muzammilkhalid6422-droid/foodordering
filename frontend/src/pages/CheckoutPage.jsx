import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const CheckoutPage = () => {
  if (!stripePromise) {
    return <div className="min-h-screen p-8 text-black dark:text-white" role="status">Online payments are currently unavailable. Please try again later.</div>;
  }
  return (
    <div className="min-h-screen text-black dark:text-white">
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default CheckoutPage;
