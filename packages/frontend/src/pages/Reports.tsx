import { useState } from 'react'
import { Card, Form, DatePicker, Select, Button, Space, Table, Tag } from 'antd'
import { FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { toast } from 'sonner'
import dayjs from 'dayjs'
import type { RangePickerProps } from 'antd/es/date-picker'

const { RangePicker } = DatePicker

const Reports = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const handleGenerate = async (values: any) => {
    setLoading(true)
    try {
      const response = await api.post('/report/generate', {
        reportType: values.reportType,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
      })
      setReportData(response.data.data)
      toast.success('Report generated successfully')
    } catch (error) {
      // Error handled by interceptor
    } finally {
      setLoading(false)
    }
  }

  const handleExportExcel = async () => {
    const values = form.getFieldsValue()
    if (!values.reportType || !values.dateRange) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await api.post(
        '/report/export/excel',
        {
          reportType: values.reportType,
          startDate: values.dateRange[0].toISOString(),
          endDate: values.dateRange[1].toISOString(),
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${Date.now()}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report exported to Excel')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const handleExportPDF = async () => {
    const values = form.getFieldsValue()
    if (!values.reportType || !values.dateRange) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const response = await api.post(
        '/report/export/pdf',
        {
          reportType: values.reportType,
          startDate: values.dateRange[0].toISOString(),
          endDate: values.dateRange[1].toISOString(),
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `report-${Date.now()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Report exported to PDF')
    } catch (error) {
      toast.error('Failed to export report')
    }
  }

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current > dayjs().endOf('day')
  }

  const incomeColumns = [
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ]

  const expenseColumns = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => category || '-',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('MMM DD, YYYY'),
    },
  ]

  const formatCurrency = (amount: number) => {
    return `RWF ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Financial Reports</h1>
      </div>

      <Card title="Generate Report">
        <Form form={form} layout="vertical" onFinish={handleGenerate}>
          <Form.Item
            name="reportType"
            label="Report Type"
            rules={[{ required: true, message: 'Please select report type!' }]}
          >
            <Select placeholder="Select report type">
              <Select.Option value="income">Income Report</Select.Option>
              <Select.Option value="expense">Expense Report</Select.Option>
              <Select.Option value="budget">Budget Report</Select.Option>
              <Select.Option value="summary">Summary Report</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Date Range"
            rules={[{ required: true, message: 'Please select date range!' }]}
          >
            <RangePicker style={{ width: '100%' }} disabledDate={disabledDate} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Generate Report
              </Button>
              <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
                Export Excel
              </Button>
              <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>
                Export PDF
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {reportData && (
        <div className="space-y-4">
          {(reportData.incomes || reportData.expenses || reportData.budgets) && (
            <Card title="Report Summary">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {reportData.incomes && (
                  <div>
                    <div className="text-sm text-gray-500">Total Income</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        reportData.incomes.reduce((sum: number, inc: any) => sum + Number(inc.amount), 0)
                      )}
                    </div>
                  </div>
                )}
                {reportData.expenses && (
                  <div>
                    <div className="text-sm text-gray-500">Total Expenses</div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(
                        reportData.expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0)
                      )}
                    </div>
                  </div>
                )}
                {reportData.incomes && reportData.expenses && (
                  <div>
                    <div className="text-sm text-gray-500">Net Balance</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        reportData.incomes.reduce((sum: number, inc: any) => sum + Number(inc.amount), 0) -
                        reportData.expenses.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0)
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {reportData.incomes && reportData.incomes.length > 0 && (
            <Card title="Income Details">
              <Table
                columns={incomeColumns}
                dataSource={reportData.incomes}
                rowKey="incomeId"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {reportData.expenses && reportData.expenses.length > 0 && (
            <Card title="Expense Details">
              <Table
                columns={expenseColumns}
                dataSource={reportData.expenses}
                rowKey="expenseId"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}

          {reportData.budgets && reportData.budgets.length > 0 && (
            <Card title="Budget Details">
              <Table
                columns={[
                  { title: 'Category', dataIndex: 'category', key: 'category' },
                  {
                    title: 'Planned',
                    dataIndex: 'plannedAmount',
                    key: 'plannedAmount',
                    render: (amt: number) => formatCurrency(amt),
                  },
                  {
                    title: 'Period',
                    dataIndex: 'period',
                    key: 'period',
                    render: (p: string) => <Tag>{p}</Tag>,
                  },
                ]}
                dataSource={reportData.budgets}
                rowKey="budgetId"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports
