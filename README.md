A small budget tracking project created using a combination of React, JS, HTML/CSS for the frontend and node.js + express.js for the backend. Incorporates and makes use of MongoDB Atlas and mongoose to store, retrieve, update and delete data to help you keep track of your expenses and income. The project comes with a small set of features including: 
1. Category Management: Allows you to create and tailor categories to your personal liking.
2. Transaction Management: Functionality that allows you to create/store any transactions of yours, whether it be an expense or income, using the custom categories you've defined. Automatically converts the rate of transactions when the provided currency differs from your (preferred) currency that's defined on account creation. Stores the fiscal values of both the base (provided) and target (preferred) currencies if you so choose to make transactions using an alternative currency.
3. Account Balance: Provides a summary of all account activities, allowing for the filtering of data by date ranges, transaction types (income / expense), payment methods (card / cash), and categories.
4. Totals: A simple page displaying your total income/expense and how much of that was paid/received with alternative currencies, respectively. Also allows for the filtering of expenses by categories.

**You will need to receive a free key from https://www.exchangerate-api.com/ as API calls are made to this service for currency conversions.**

