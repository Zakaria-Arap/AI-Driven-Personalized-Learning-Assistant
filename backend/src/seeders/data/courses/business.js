const { mc, num, topic, strand } = require('./_h');
module.exports = {
  code: 'BUS', name: 'Business Studies', pathway: 'social',
  grades: {
    10: [
      strand('Foundations of Business', [
        topic('intro', 'Introduction to business', 'Explain needs, wants and factors of production.', [], [
          mc('Which is a factor of production?', 'Land', ['Profit', 'Revenue', 'Loan interest'], 'Land, labour, capital and enterprise.'),
          mc('Something a person must have to survive is a ____.', 'need', ['want', 'luxury', 'service'], 'Food and shelter are needs.'),
          num('A shop earned revenue of KES 50 000 and had costs of KES 35 000. What was the profit in KES?', 15000, 'profit = revenue - costs = 15 000'),
        ]),
        topic('envt', 'Business environment and ethics', 'Describe influences on business and ethical behaviour.', [], [
          mc('A law passed by government that affects business is part of the ____ environment.', 'political/legal', ['natural', 'social only', 'physical'], 'Laws and regulations.'),
          mc('Which is an unethical business practice?', 'Selling expired goods', ['Paying tax', 'Giving receipts', 'Honest advertising'], 'It harms customers.'),
          mc('Corporate social responsibility means a business ____.', 'contributes positively to society', ['avoids tax', 'ignores customers', 'pollutes freely'], 'It considers community and environment.'),
        ]),
      ]),
      strand('Business Structures', [
        topic('owner', 'Forms of business ownership', 'Compare sole proprietorship, partnership and company.', [], [
          mc('A business owned and run by one person is a ____.', 'sole proprietorship', ['partnership', 'cooperative', 'public company'], 'One owner takes all the profit and risk.'),
          mc('A partnership is formed by ____.', 'two or more people', ['one person', 'the government only', 'shareholders only'], 'Partners share profits.'),
          mc('Owners of a company are called ____.', 'shareholders', ['partners', 'directors only', 'employees'], 'They own shares.'),
        ]),
        topic('money', 'Money and banking', 'Describe functions of money and commercial banks.', [], [
          mc('One function of money is ____.', 'a medium of exchange', ['a source of rain', 'a type of tax', 'a barter system'], 'It is accepted in payment.'),
          mc('Which is a service provided by commercial banks?', 'Accepting deposits', ['Printing money', 'Making laws', 'Setting exchange rate by decree'], 'Banks keep deposits and lend.'),
          mc('The Central Bank of Kenya ____.', 'regulates the money supply', ['sells groceries', 'builds roads', 'trains teachers'], 'It is the banker to the government.'),
        ]),
      ]),
    ],
    11: [
      strand('Accounting', [
        topic('equation', 'The accounting equation and ledgers', 'Use assets, liabilities and capital.', [], [
          num('A business has assets of KES 80 000 and liabilities of KES 30 000. What is the capital in KES?', 50000, 'Assets = Liabilities + Capital\nCapital = 80 000 - 30 000 = 50 000'),
          mc('In double-entry bookkeeping every transaction has ____.', 'a debit and a credit', ['two debits', 'two credits', 'no entry'], 'Total debits equal total credits.'),
          mc('Goods taken from a business for personal use are called ____.', 'drawings', ['sales', 'purchases', 'discount'], 'They reduce capital.'),
        ]),
        topic('gp', 'Trading account and gross profit', 'Calculate cost of sales and gross profit.', ['equation'], [
          num('Sales are KES 120 000 and cost of goods sold is KES 80 000. Find the gross profit in KES.', 40000, 'Gross profit = sales - cost of goods sold = 40 000'),
          num('Opening stock 10 000, purchases 70 000, closing stock 15 000. Find the cost of goods sold in KES.', 65000, '10 000 + 70 000 - 15 000 = 65 000', 0, 2),
          mc('A trial balance is prepared to check that ____.', 'total debits equal total credits', ['profit is high', 'stock is sold', 'tax is paid'], 'It checks the arithmetic accuracy of the ledgers.'),
        ]),
      ]),
      strand('Marketing and Enterprise', [
        topic('market', 'Marketing', 'Explain the marketing mix.', [], [
          mc('The four Ps of the marketing mix are product, price, place and ____.', 'promotion', ['profit', 'people only', 'payment'], 'Promotion includes advertising.'),
          mc('Dividing a market into groups of similar customers is ____.', 'market segmentation', ['bartering', 'auditing', 'insuring'], 'It helps target customers.'),
          mc('A brand is ____.', 'a name or symbol that identifies a product', ['a type of tax', 'a loan', 'a stock'], 'Brands build recognition.'),
        ]),
        topic('entrep', 'Entrepreneurship', 'Describe qualities and roles of an entrepreneur.', [], [
          mc('An entrepreneur is a person who ____.', 'starts and runs a business taking risk', ['only works for others', 'avoids all risk', 'collects taxes'], 'Entrepreneurs organise resources.'),
          mc('A document that sets out business goals and plans is a ____.', 'business plan', ['balance sheet', 'receipt', 'invoice'], 'It guides and attracts funding.'),
          mc('A quality of a good entrepreneur is ____.', 'creativity and perseverance', ['laziness', 'dishonesty', 'fear of change'], 'They innovate and keep trying.'),
        ]),
      ]),
    ],
    12: [
      strand('Costs and Finance', [
        topic('breakeven', 'Break-even analysis', 'Calculate the break-even point.', [], [
          num('Fixed costs are KES 20 000. Selling price is KES 50 and variable cost is KES 30 per unit. Find the break-even number of units.', 1000, 'contribution per unit = 50 - 30 = 20\nunits = 20 000 / 20 = 1000', 0, 2),
          num('A firm sells 500 units at KES 40 each. Find total revenue in KES.', 20000, '500 x 40 = 20 000'),
          mc('Rent is an example of a ____ cost.', 'fixed', ['variable', 'marginal', 'sunk only'], 'It does not change with output.'),
        ]),
        topic('finance', 'Sources of business finance', 'Compare sources of finance.', [], [
          mc('Money put into a business by its owners is ____.', 'capital', ['a loan', 'an overdraft', 'trade credit'], 'Owners\' funds.'),
          mc('Which is a long-term source of finance?', 'Debentures', ['Trade credit', 'Bank overdraft', 'Accrued wages'], 'Debentures are long-term loans.'),
          mc('A SACCO provides ____.', 'savings and loans to members', ['free goods', 'tax refunds', 'bus services only'], 'Savings and credit cooperative.'),
        ]),
      ]),
      strand('Final Accounts and Law', [
        topic('final', 'Final accounts', 'Prepare a simple profit and loss account.', [], [
          num('Gross profit is KES 60 000 and expenses are KES 25 000. Find the net profit in KES.', 35000, 'Net profit = gross profit - expenses = 35 000'),
          mc('A balance sheet shows ____.', 'assets, liabilities and capital on a given date', ['sales only', 'the daily cash', 'staff names'], 'It is a statement of financial position.'),
          mc('Current assets include ____.', 'stock and debtors', ['buildings', 'land', 'machinery'], 'They are turned into cash within a year.'),
        ]),
        topic('law', 'Insurance and business law', 'Explain insurance principles and contracts.', [], [
          mc('The principle that both parties must disclose all facts in insurance is ____.', 'utmost good faith', ['indemnity', 'contribution', 'subrogation'], 'Uberrimae fidei.'),
          mc('A valid contract requires offer, acceptance and ____.', 'consideration', ['a witness only', 'a bank', 'a loan'], 'Something of value is exchanged.'),
          mc('Insurable interest means the insured ____.', 'would suffer a financial loss if the item is lost', ['is a relative of the agent', 'lives far away', 'owns no property'], 'Without it the policy is invalid.', 2),
        ]),
      ]),
    ],
  },
};
