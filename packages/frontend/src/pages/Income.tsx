import { useEffect, useState } from 'react'
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Select, Space, Popconfirm } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../utils/api'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface Income {
  incomeId: number
  source: string
  amount: number
  date: string
  category?: string
}

const Income = () => {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [form] = Form.useForm()

  const fetchIncomes = async () => {
    setLoading(true)
    try {
      const response = await api.get('/income')
      setIncomes(response.data)
    } catch (error) {
      toast.error('Failed to fetch incomes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        date: values.date.toISOString(),
      }

      if (editingIncome) {
        await api.put(`/income/${editingIncome.incomeId}`, data)
        toast.success('Income updated successfully')
      } else {
        await api.post('/income', data)
        toast.success('Income added successfully')
      }

      setModalVisible(false)
      form.resetFields()
      setEditingIncome(null)
      fetchIncomes()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleEdit = (income: Income) => {
    setEditingIncome(income)
    form.setFieldsValue({
      ...income,
      date: dayjs(income.date),
    })
    setModalVisible(true)
  }

  const handleDelete = async (incomeId: number) => {
    try {
      await api.delete(`/income/${incomeId}`)
      toast.success('Income deleted successfully')
      fetchIncomes()
    } catch (error) {
      // Error handled by interceptor
    }
  }

  const handleAdd = () => {
    setEditingIncome(null)
    form.resetFields()
    setModalVisible(true)
  }

  const columns = [
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Income) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this income?"
            onConfirm={() => handleDelete(record.incomeId)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Income Management</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Income
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={incomes}
        loading={loading}
        rowKey="incomeId"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingIncome ? 'Edit Income' : 'Add Income'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
          setEditingIncome(null)
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="source"
            label="Source"
            rules={[{ required: true, message: 'Please enter income source!' }]}
          >
            <Input placeholder="e.g., Salary, Freelance, etc." />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: 'Please enter amount!' }]}
          >
            <InputNumber
              prefix="RWF"
              placeholder="0.00"
              min={0}
              step={0.01}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item name="category" label="Category">
            <Select placeholder="Select category" allowClear>
              <Select.Option value="Salary">Salary</Select.Option>
              <Select.Option value="Freelance">Freelance</Select.Option>
              <Select.Option value="Investment">Investment</Select.Option>
              <Select.Option value="Business">Business</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Date"
            rules={[{ required: true, message: 'Please select date!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingIncome ? 'Update' : 'Add'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false)
                form.resetFields()
                setEditingIncome(null)
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Income
