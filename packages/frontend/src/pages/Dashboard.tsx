import { useEffect, useState } from 'react'
import { Card, Statistic, Table, Button, Space, Tag, Row, Col, Spin } from 'antd'
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
  ShoppingOutlined,
  PlusOutlined,
  SendOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../utils/api'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface DashboardData {
  dashboard: {
    totalIncome: number
    totalExpense: number
    netBalance: number
  }
  recentIncomes: any[]
  recentExpenses: any[]
  budgets: any[]
  categoryExpenses: any[]
  categoryIncome: any[]
  cashFlowData: {
    incomes: any[]
    expenses: any[]
  }
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard')
      setDashboardData(response.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const refreshDashboard = async () => {
    setLoading(true)
    try {
      await api.post('/dashboard/refresh')
      await fetchDashboardData()
      toast.success('Dashboard refreshed')
    } catch (error) {
      toast.error('Failed to refresh dashboard')
    } finally {
      setLoading(false)
    }
  }

  if (loading || !dashboardData) {
    return (
      <div className="w-full flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  // Prepare cash flow chart data (last 30 days, grouped by week)
  const cashFlowChartData = []
  const today = dayjs()
  for (let i = 4; i >= 0; i--) {
    const weekStart = today.subtract(i * 7, 'day')
    const weekEnd = weekStart.add(6, 'day')
    
    const weekIncome = dashboardData.cashFlowData.incomes
      .filter((inc) => {
        const date = dayjs(inc.date)
        return date.isAfter(weekStart) && date.isBefore(weekEnd.add(1, 'day'))
      })
      .reduce((sum, inc) => sum + Number(inc.amount), 0)

    const weekExpense = dashboardData.cashFlowData.expenses
      .filter((exp) => {
        const date = dayjs(exp.date)
        return date.isAfter(weekStart) && date.isBefore(weekEnd.add(1, 'day'))
      })
      .reduce((sum, exp) => sum + Number(exp.amount), 0)

    cashFlowChartData.push({
      week: weekStart.format('DD MMM'),
      income: weekIncome,
      expense: weekExpense,
    })
  }

  // Recent activity table data
  const recentActivity = [
    ...dashboardData.recentIncomes.map((inc) => ({
      key: `income-${inc.incomeId}`,
      type: (
        <Tag color="green" icon={<PlusOutlined />}>
          Income
        </Tag>
      ),
      description: inc.source,
      amount: `RWF ${Number(inc.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      date: dayjs(inc.date).format('MMM DD, YYYY'),
      status: <Tag color="success">Success</Tag>,
    })),
    ...dashboardData.recentExpenses.map((exp) => ({
      key: `expense-${exp.expenseId}`,
      type: (
        <Tag color="red" icon={<ArrowDownOutlined />}>
          Expense
        </Tag>
      ),
      description: exp.description,
      amount: `-RWF ${Number(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      date: dayjs(exp.date).format('MMM DD, YYYY'),
      status: <Tag color="default">Pending</Tag>,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  const activityColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  const formatCurrency = (amount: number) => {
    return `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="w-full space-y-6">
      <Row gutter={[16, 16]}>
        {/* Total Balance Card */}
        <Col xs={24} lg={12} xl={10}>
          <Card
            className="h-full w-full"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <div className="text-white">
              <div className="text-sm mb-2 opacity-90">Total Balance</div>
              <div className="text-4xl font-bold mb-2">
                {formatCurrency(dashboardData.dashboard.netBalance)}
              </div>
              <div className="flex items-center gap-2">
                <ArrowUpOutlined />
                <span>15.8%</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button type="primary" icon={<PlusOutlined />} ghost>
                Add
              </Button>
              <Button icon={<SendOutlined />} ghost>
                Send
              </Button>
              <Button icon={<ReloadOutlined />} ghost>
                Request
              </Button>
            </div>
          </Card>
        </Col>

        {/* Income Card */}
        <Col xs={24} sm={12} lg={6} xl={7}>
          <Card className="w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center">
                <DollarOutlined className="text-teal-600 text-lg" />
              </div>
              <div className="text-sm text-gray-500">Income</div>
            </div>
            <Statistic
              value={dashboardData.dashboard.totalIncome}
              prefix="RWF"
              precision={2}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
            />
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpOutlined className="text-green-500" />
              <span className="text-green-500">45.0%</span>
            </div>
          </Card>
        </Col>

        {/* Expense Card */}
        <Col xs={24} sm={12} lg={6} xl={7}>
          <Card className="w-full">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                <ShoppingOutlined className="text-green-600 text-lg" />
              </div>
              <div className="text-sm text-gray-500">Expense</div>
            </div>
            <Statistic
              value={dashboardData.dashboard.totalExpense}
              prefix="RWF"
              precision={2}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold' }}
            />
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownOutlined className="text-red-500" />
              <span className="text-red-500">12.5%</span>
            </div>
          </Card>
        </Col>

        {/* Cash Flow Chart */}
        <Col xs={24} lg={12} xl={24}>
          <Card
            className="w-full"
            title="Cash Flow"
            extra={
              <Space>
                <Button size="small">Weekly</Button>
                <Button size="small" type="primary">
                  Daily
                </Button>
                <Button size="small" icon={<ReloadOutlined />} onClick={refreshDashboard}>
                  Manage
                </Button>
              </Space>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={cashFlowChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => `RWF ${Number(value).toLocaleString()}`} />
                <Bar dataKey="income" fill="#10b981" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="w-full">
        {/* Recent Activity */}
        <Col xs={24} lg={16}>
          <Card
            className="w-full"
            title="Recent Activity"
            extra={
              <Space>
                <Button size="small">Filter</Button>
                <Button size="small">Sort</Button>
              </Space>
            }
          >
            <Table
              dataSource={recentActivity}
              columns={activityColumns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Budget Summary */}
        <Col xs={24} lg={8}>
          <Card className="w-full" title="Budget Summary">
            <div className="space-y-4">
              {dashboardData.budgets.slice(0, 3).map((budget) => {
                const percentage = (Number(budget.actualAmount) / Number(budget.plannedAmount)) * 100
                return (
                  <div key={budget.budgetId} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{budget.category}</span>
                      <span>
                        {formatCurrency(Number(budget.actualAmount))} /{' '}
                        {formatCurrency(Number(budget.plannedAmount))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{budget.period}</div>
                  </div>
                )
              })}
              {dashboardData.budgets.length === 0 && (
                <div className="text-center text-gray-500 py-4">No budgets created yet</div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
