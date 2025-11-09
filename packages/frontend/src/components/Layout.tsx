import { useState } from 'react'
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Space, Switch } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  DashboardOutlined,
  DollarOutlined,
  ShoppingOutlined,
  FundOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  PlusOutlined,
  SendOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = AntLayout

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/income',
      icon: <DollarOutlined />,
      label: 'Income',
    },
    {
      key: '/expense',
      icon: <ShoppingOutlined />,
      label: 'Expense',
    },
    {
      key: '/budget',
      icon: <FundOutlined />,
      label: 'Budget',
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
    {
      key: '/help',
      icon: <QuestionCircleOutlined />,
      label: 'Help',
    },
  ]

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
    },
  ]

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    } else if (key === 'profile') {
      // Handle profile
    } else if (key === 'settings') {
      // Handle settings
    } else {
      navigate(key)
    }
  }

  return (
    <AntLayout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white border-r border-gray-200"
        width={250}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            {!collapsed && <span className="font-bold text-lg">ART BUDGET</span>}
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-0"
        />
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            {!collapsed && <span className="text-sm text-gray-500">Pro Mode</span>}
            <Switch defaultChecked size="small" />
          </div>
          {!collapsed && (
            <div className="text-xs text-gray-400 mt-2">© 2024 ART BUDGET Inc.</div>
          )}
        </div>
      </Sider>
      <AntLayout>
        <Header className="bg-white px-4 flex items-center justify-between border-b border-gray-200">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="text-lg"
          />
          <Space>
            <Button type="primary" icon={<PlusOutlined />}>
              Add
            </Button>
            <Button icon={<SendOutlined />}>Send</Button>
            <Button icon={<ReloadOutlined />}>Request</Button>
            <Dropdown menu={{ items: userMenuItems, onClick: handleMenuClick }} placement="bottomRight">
              <Space className="cursor-pointer">
                <Avatar icon={<UserOutlined />} />
                {user && <span>{user.username}</span>}
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">{children}</Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
