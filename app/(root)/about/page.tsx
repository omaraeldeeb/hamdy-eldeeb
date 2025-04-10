import React from "react";

export const metadata = {
  title: "About Us",
  description: "Learn more about our company and mission",
};

const AboutPage = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Us</h1>

        <div className="prose prose-lg dark:prose-invert">
          <p>
            Welcome to our store! We are dedicated to providing high-quality
            products and excellent customer service.
          </p>

          <h2>Our Story</h2>
          <p>
            Founded in 2023, our company has grown from a small local shop to an
            online retailer serving customers worldwide. Our journey has been
            driven by a passion for quality and customer satisfaction.
          </p>

          <h2>Our Mission</h2>
          <p>
            We strive to offer the best products at competitive prices while
            ensuring an excellent shopping experience for all our customers.
          </p>

          <h2>Our Values</h2>
          <ul>
            <li>
              <strong>Quality:</strong> We only sell products that meet our high
              standards
            </li>
            <li>
              <strong>Integrity:</strong> We are honest and transparent in all
              our dealings
            </li>
            <li>
              <strong>Customer Focus:</strong> Your satisfaction is our top
              priority
            </li>
            <li>
              <strong>Innovation:</strong> We continuously improve our products
              and services
            </li>
          </ul>

          <p>
            Thank you for choosing us. We look forward to serving you and
            exceeding your expectations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
