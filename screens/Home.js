import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { TabView } from 'react-native-tab-view';

import MyPicks from './Shared/MyPicks';

const SecondRoute = () => {
    return (
        <View style={{ flex: 1, backgroundColor: '#673ab7' }}></View>
    )
}

const ThirdRoute = () => {
    return (
        <View style={{ flex: 1 }}></View>
    )
}



class Home extends Component {

    constructor(props) {
        super(props)
        this.state = {
            nominations: [],
            index: 0,
            routes: [
                { key: 'mypicks', title: 'My Picks' },
                { key: 'scoreboard', title: 'Scoreboard' },
                { key: 'friendspicks', title: "Other's Picks" }
            ]
        }
    }
    
    renderScene = ({route}) => {
        console.log(route)
        switch (route.key) {
            case 'mypicks':
                return <MyPicks navigation={this.props.navigation}/>
            case 'scoreboard':
                return SecondRoute;
            case 'friendspicks':
                return ThirdRoute;
            default:
                return null;
        }
    }

    render() {
        return (
                <TabView
                    navigation={this.props.navigation}
                    navigationState={this.state}
                    renderScene={this.renderScene}
                    onIndexChange={index => this.setState({ index })}
                    initialLayout={{ width: Dimensions.get('window').width }}
                />
        )
    }
}

export default Home;