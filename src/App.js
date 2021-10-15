import React from 'react';
import { LineChart, Line, XAxis, CartesianGrid, YAxis, Tooltip } from 'recharts';
import Spinner from './spinner/Spinner';

import './App.scss';


// Application Programming Interface let our products or services communicate with other products and services 
// without having to know how they are implemented. We send the request to the API and tell what we want to recieve.
// API get our request, interprets it, performs necessary actions and sends it back to our application in a readable way.
class App extends React.Component {
  state = {
    data: [],
    loading: true
  }
// class properties that store information about company's symbol I will use to create endpoint
  apiKey = 'LW15KDPWT4NF50TB';
  symbols = [
    {name: 'Tesco London', symbol: 'TSCO.LON'},
    {name: 'IBM', symbol: 'IBM'},
    {name: 'Shopify Inc', symbol: 'SHOP.TRT'},
    {name: 'GreenPower Motor Company Inc', symbol: 'GPV.TRV'},
    {name: 'Daimler AG', symbol: 'DAI.DEX'},
    {name: 'Reliance Industries Limited', symbol: 'RELIANCE.BSE'},
    {name: 'SAIC Motor Corporation', symbol: '600104.SHH'},
    {name: 'China Vanke Company Ltd', symbol: '000002.SHZ'}
    ]
// After the component was rendered to the DOM we call lifecycle method componentDidMount which calls getAllData
  componentDidMount() {
    this.getAllData();
  }

  renderLineChart = (data) => {
    return (
        <LineChart width={380} height={180} data={data}>
            <Line type="monotone" dataKey="close" stroke="#8884d8" dot={false} />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
        </LineChart>
    )
  };

  getData = async (url) => {
    let res = await fetch(url);

        if(!res.ok) {
            throw new Error(`Could not fetch ${url} status: ${res.status}`);
        }

        return res.json();
  }
// this method loops through the array of company's name and their symbols, sends requests with specific symbol as query parameter to the Api via getData method. 
// As a result we get object with information about daily prices.
// Also I use Promise.all to wait all request are done and then pass each object I recieved to the getValues method which transform an object to an array of objects
  getAllData = () => {
    const requests = this.symbols.slice(0, 5).map(async item => {
        return {
            name: item.name,
            responce: await this.getData(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${item.symbol}&outputsize=compact&apikey=${this.apiKey}`)
        }
    })
    Promise.all(requests)
        .then(res => res.map(item => this.getValues(item)))
        .then(res => this.dataLoaded(res))
    setTimeout(() => {
        const requests = this.symbols.slice(5).map(async item => {
            return {
                name: item.name,
                responce: await this.getData(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${item.symbol}&outputsize=compact&apikey=${this.apiKey}`)
            }
        })
        Promise.all(requests)
            .then(res => res.map(item => this.getValues(item)))
            .then(res => this.dataLoaded(res))
    }, 61000)
  }
// getValues recieves an object as a parameter and returns array of objects with properties that we need, company's name, specific day and close price. 
  getValues = (object) => {
    const arr = [];
    const name = object.name;
    for(let key in object.responce['Time Series (Daily)']) {
        arr.push({
            'name': name, 
            'day': key.slice(-2),
            'close': object.responce['Time Series (Daily)'][key]["4. close"] 
        })
    }
    return arr;
  }
  
  // When all data are recieved and transformed the dataLoaded is called and then updates the state to actual data.
  // Loading sets to false in order to replace Spinner with recieved data on the web page.
   
  dataLoaded = (data) => {
    this.setState({
        data: [...this.state.data, ...data],
        loading: false
    })
  }

  // renderItems is used to create a list of items and helps us not repeat the same code.
  // I use it in render method
  renderItems = (data) => {
    const items = data.map((item, i) => {
      item.reverse();

      return (
        <div className='list__item' key={i}>
          <div className='list__img'>
          {
            this.renderLineChart(item)
          }
          </div>
          <div className='list__company'>{item[0] ? item[0].name : 'Company name'}</div>
        </div>
      )
    });
    
    return (
      <div className='app__list'>
        {items}
      </div>
    );
  }

  render() {
// I use destruction to get properties from the state.
    const {data, loading} = this.state;
    const items = this.renderItems(data);
// if data aren't recieved loading is true so we get Spinner in load variable;
    const load = loading ? <Spinner /> : null;
// when data are recieved loading is false so we get array of elements in content variable or null if data aren't recieved
    const content = !loading ? items : null;

    return (
      <React.Fragment>
        <div className='app'>
          <div className='app__content'>
            <div className='app__title'>
              <h4>Tech</h4>
            </div>
            
              {load}
              {content}
              {data.length === 8 ? null : <Spinner/>}
            
          </div>
        </div>
      </React.Fragment>
    );
  }
}


export default App;
