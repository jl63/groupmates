import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { history } from 'umi'
import { connect } from 'umi'
import { Row, Col, Button, Popconfirm, Form, Input, Table } from 'antd'
import { Page } from 'components'
import { stringify } from 'qs'
import List from './components/List'
import styles from './components/List.less'
import axios from 'axios'
import store from 'store'
import { Link } from 'umi'

// @connect(({ user, loading }) => ({ user, loading }))
class User extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      searchName: "",
      search: false,
      all_data: [],
      old_data: [],
    }
    this.displayUserInfo()
  }

  handleRefresh = newQuery => { //reset
    const { location } = this.props
    const { query, pathname } = location

    history.push({
      pathname,
      search: stringify(
        {
          ...query,
          ...newQuery,
        },
        { arrayFormat: 'repeat' }
      ),
    })
  }

  getProgrammngLanguage(data){
    let languages = []
    if (data.first != "") {
      languages.push(data.first)
    }
    if (data.second != "") {
      languages.push(data.second)
    }
    if (data.third != "") {
      languages.push(data.third)
    }
    if (languages.length == 0) {
      return ""
    } else {
      let language = languages[0]
      for (let j = 1; j < languages.length; j++) {
        language = language + ", " + languages[j]
      }
      return language
    }
  }

  getSkills(data){
    let s = ""
    if (data.server != "") {
      let all_s = JSON.parse(data.server)
      s = all_s[0]
      for (let j = 1; j < all_s.length; j++) {
        s = s + ", " + all_s[j]
      }
    }
    let c = ""
    if (data.client != "") {
      let all_c = JSON.parse(data.client)
      c = all_c[0]
      for (let j = 1; j < all_c.length; j++) {
        c = c + ", " + all_c[j]
      }
    }
    if (s == "" && c == ""){
      return ""
    } else if (s == "") {
      return c
    } else if (c == "") {
      return s
    } else {
      return s+", "+c
    }
  }

  displayUserInfo() {
    console.log('get all user info')
    const url = '/api/v1/sortIndividuals';
    axios.get(url,{
      params: {
        userId: store.get('user').id,
        open: 1,
      },                                   
    }).then((response) => {
      let a = response['data']
      console.log(a)
      let all_datas = []
      for (let i = 0; i < a.length; i++) {
        const newItem = {
          "id": a[i].id,
          "name": a[i].name,
          "email": a[i].email,
          "grade": a[i].year,
          "language": this.getProgrammngLanguage(a[i]),
          "skill": this.getSkills(a[i]),
        }
        all_datas.push(newItem)
      }
      this.setState({
        all_data: all_datas,
        old_data: all_datas,
      })
    }).catch(error => {
        console.log('Get children list', error);
    });
  }

  getSearchList(){
    console.log('get all user info')
    const url = '/api/v1/searchByName'
    axios.get(url,{
      params: {
        userId: store.get('user').id,
        target: this.state.searchName,
      },                                   
    }).then((response) => {
      let a = response['data']
      console.log(a)
      let all_datas = []
      for (let i = 0; i < a.length; i++) {
        const newItem = {
          "id": a[i].id,
          "name": a[i].name,
          "email": a[i].email,
          "grade": a[i].year,
          "language": this.getProgrammngLanguage(a[i]),
          "skill": this.getSkills(a[i]),
        }
        all_datas.push(newItem)
      }
      this.setState({
        all_data: all_datas,
      })
    }).catch(error => {
      console.log('Get children list', error);
    });

  }

  resetSearchList(){
    this.setState({
      all_data: this.state.old_data,
    })
    console.log(this.state.all_data)
  }

  render() {
    const { user, ...tableProps } = this.props
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text, record)=><Link to={`user/${record.id}`}>{text}</Link>,
      },
      { 
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Grade',
        dataIndex: 'grade',
        key: 'grade',
      },
      {
        title: 'Programming Language',
        dataIndex: 'language',
        key: 'language',
      },
      {
        title: 'Frameworks',
        dataIndex: 'skill',
        key: 'skill',
      },
      {
        title: 'Invitation',
        key: 'operation',
        fixed: 'right',
        render: (text, record) => {
          return (
            <Button
            type="primary"
                  onClick={() => {
                  }}
                >
              Send
            </Button>
          )
        },
      },
    ]

    return (
      <Page inner>
        {/* <Filter {...this.filterProps} /> */}
        {(
          <Row gutter={24}>
            <Col xl={{ span: 8 }} md={{ span: 1 }} style={{ marginBottom: 16, fontSize: 20 }}>
            Looking for Individuals
            </Col>
            <Col xl={{ span: 9 }} md={{ span: 1 }}></Col>
            <Col xl={{ span: 4 }} md={{ span: 1 }}>
              <Form.Item name="name">
              <Input
                placeholder={'Search Name'}
                value={this.state.searchName}
                onChange={(e)=>{
                  this.setState({searchName: e.target.value});
                }}
              />
              </Form.Item>
            </Col>
          <Col>
            <Row type="flex" justify="space-between">
              <div>
                <Button
                  className="margin-right"
                  onClick={()=>{
                    this.getSearchList();
                  }}
                >
                  Search
                </Button>
                <Button type="dashed" onClick={()=>{
                    this.resetSearchList();
                  }}
                >
                  Reset
                </Button>
              </div>
            </Row>
          </Col>
          </Row>
        )}
        {/* <List {...this.listProps}/> */}
        <Table
        {...tableProps}
        pagination={{
          ...tableProps.pagination,
          showTotal: total => `Total ${total} Items`,
        }}
        className={styles.table}
        bordered
        scroll={{ x: 1200 }}
        dataSource={this.state.all_data}
        columns={columns}
        simple
        rowKey={record => record.id}
      />
      </Page>
    )
  }
}

User.propTypes = {
  user: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  loading: PropTypes.object,
}

export default User
