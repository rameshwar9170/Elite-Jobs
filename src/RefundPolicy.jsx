import React from 'react';

const RefundPolicy = () => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Cancellation & Refund Policy</h2>
      <p style={styles.updated}>Last updated on 25-06-2025 22:46:09</p>

      <p>
        <strong>RAMESHWAR NARAYAN SHINDE</strong> believes in helping its customers as far as possible, and has
        therefore a liberal cancellation policy. Under this policy:
      </p>

      <ul style={styles.list}>
        <li>
          Cancellations will be considered only if the request is made immediately after placing the order.
          However, the cancellation request may not be entertained if the orders have been communicated to the
          vendors/merchants and they have initiated the process of shipping them.
        </li>
        <li>
          <strong>RAMESHWAR NARAYAN SHINDE</strong> does not accept cancellation requests for perishable items
          like flowers, eatables etc. However, refund/replacement can be made if the customer establishes that
          the quality of the product delivered is not good.
        </li>
        <li>
          In case of receipt of damaged or defective items please report the same to our Customer Service team.
          The request will, however, be entertained once the merchant has checked and determined the same at
          their end. This should be reported within <strong>only same day</strong> of receipt of the products.
        </li>
        <li>
          In case you feel that the product received is not as shown on the site or as per your expectations,
          you must bring it to the notice of our Customer Service within <strong>only same day</strong> of
          receiving the product. The Customer Service Team, after looking into your complaint, will take an
          appropriate decision.
        </li>
        <li>
          In case of complaints regarding products that come with a warranty from manufacturers, please refer
          the issue to them.
        </li>
        <li>
          In case of any refunds approved by <strong>RAMESHWAR NARAYAN SHINDE</strong>, it’ll take
          <strong> 9–15 days</strong> for the refund to be processed to the end customer.
        </li>
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.7',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '26px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  updated: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
  },
  list: {
    paddingLeft: '20px',
    marginTop: '10px',
  },
};

export default RefundPolicy;
