import { Card, Collapse, Typography, Space, Divider } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

const Help = () => {
  const faqItems = [
    {
      key: '1',
      label: 'How do I add income?',
      children: (
        <div>
          <Paragraph>
            To add income, navigate to the <Text strong>Income</Text> page from the sidebar.
            Click the <Text strong>"Add Income"</Text> button, fill in the source, amount, date,
            and optionally a category, then click <Text strong>"Add"</Text>.
          </Paragraph>
        </div>
      ),
    },
    {
      key: '2',
      label: 'How do I track expenses?',
      children: (
        <div>
          <Paragraph>
            Go to the <Text strong>Expense</Text> page and click <Text strong>"Add Expense"</Text>.
            Enter the description, amount, date, and category. You can edit or delete expenses
            later using the action buttons in the table.
          </Paragraph>
        </div>
      ),
    },
    {
      key: '3',
      label: 'How do I create a budget?',
      children: (
        <div>
          <Paragraph>
            Navigate to the <Text strong>Budget</Text> page and click <Text strong>"Create Budget"</Text>.
            Select a category, enter the planned amount, and choose a period (weekly, monthly, or yearly).
            The system will automatically track your actual spending against your budget.
          </Paragraph>
        </div>
      ),
    },
    {
      key: '4',
      label: 'How do I generate reports?',
      children: (
        <div>
          <Paragraph>
            Go to the <Text strong>Reports</Text> page, select a report type (Income, Expense, Budget, or Summary),
            choose a date range, and click <Text strong>"Generate Report"</Text>. You can also export
            reports to Excel or PDF format.
          </Paragraph>
        </div>
      ),
    },
    {
      key: '5',
      label: 'What does the Dashboard show?',
      children: (
        <div>
          <Paragraph>
            The Dashboard provides an overview of your financial status including:
          </Paragraph>
          <ul className="list-disc ml-6 mt-2">
            <li>Total Balance (Net Income - Expenses)</li>
            <li>Total Income and Expenses</li>
            <li>Cash Flow Chart (last 30 days)</li>
            <li>Recent Activity (latest transactions)</li>
            <li>Budget Summary (progress for each budget)</li>
          </ul>
        </div>
      ),
    },
    {
      key: '6',
      label: 'How do I export my data?',
      children: (
        <div>
          <Paragraph>
            You can export your financial data in two ways:
          </Paragraph>
          <ol className="list-decimal ml-6 mt-2">
            <li>
              <Text strong>From Reports page:</Text> Generate a report and click either
              <Text strong>"Export Excel"</Text> or <Text strong>"Export PDF"</Text> buttons.
            </li>
            <li>
              <Text strong>Export Data feature:</Text> This feature allows you to backup all your
              financial information for safe keeping.
            </li>
          </ol>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <QuestionCircleOutlined className="text-3xl text-teal-500" />
        <Title level={2}>Help & Tutorials</Title>
      </div>

      <Card>
        <Title level={3}>Getting Started</Title>
        <Paragraph>
          Welcome to ART BUDGET! This personal finance management system helps you track your income,
          manage expenses, create budgets, and generate financial reports. Follow the tutorials below
          to get started.
        </Paragraph>
      </Card>

      <Card title="Frequently Asked Questions">
        <Collapse items={faqItems} defaultActiveKey={['1']} />
      </Card>

      <Card title="Tutorials">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={4}>1. Registration & Login</Title>
            <Paragraph>
              To get started, you need to create an account. Click on <Text strong>"Register"</Text> on the
              login page, enter your username, email, and password. Once registered, you can log in using
              your email and password.
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>2. Adding Income</Title>
            <Paragraph>
              Income can be added from various sources such as salary, freelance work, investments, etc.
              Navigate to the Income page, click "Add Income", fill in the details, and save. You can
              categorize your income for better tracking.
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>3. Managing Expenses</Title>
            <Paragraph>
              Track all your expenses by adding them through the Expense page. Categorize expenses
              (Food, Transport, Shopping, etc.) to get better insights. You can edit or delete expenses
              anytime.
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>4. Creating Budgets</Title>
            <Paragraph>
              Set budget goals for different categories and time periods. The system will automatically
              track your spending against your budget and show progress indicators. Budgets help you
              stay on track with your financial goals.
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>5. Viewing Dashboard</Title>
            <Paragraph>
              The Dashboard gives you a comprehensive overview of your finances at a glance. You can
              see your total balance, income vs expenses, cash flow trends, and recent activity. The
              dashboard updates automatically as you add transactions.
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>6. Generating Reports</Title>
            <Paragraph>
              Generate detailed financial reports for any date range. Reports can be exported to Excel
              or PDF format for record-keeping or sharing. Use reports to analyze your spending patterns
              and make informed financial decisions.
            </Paragraph>
          </div>
        </Space>
      </Card>

      <Card title="Tips & Best Practices">
        <ul className="list-disc ml-6 space-y-2">
          <li>Record income and expenses regularly to maintain accurate financial data.</li>
          <li>Use categories consistently to get meaningful insights from your reports.</li>
          <li>Set realistic budgets based on your past spending patterns.</li>
          <li>Review your dashboard weekly to track your financial progress.</li>
          <li>Export reports monthly for record-keeping and tax purposes.</li>
          <li>Use the cash flow chart to identify spending trends.</li>
        </ul>
      </Card>

      <Card title="Need More Help?">
        <Paragraph>
          If you need additional assistance, please contact our support team or refer to the
          documentation. We're here to help you manage your finances effectively!
        </Paragraph>
      </Card>
    </div>
  )
}

export default Help
