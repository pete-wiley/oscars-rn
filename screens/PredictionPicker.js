import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, AsyncStorage } from 'react-native';
import { Button } from 'react-native-elements';
import { pics } from '../assets/key';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

class PredictionPicker extends Component {
    constructor(props) {
        super(props)
        this.state = {
            info: this.props.navigation.state.params,
            myPredictions: this.props.navigation.state.params.nominees,
            scrollEnabled: true,
            userHasPredicted: false,
            loading: false,
            status: 'Loading...',
            readOnly: false
        }
    }

    componentDidMount() {
        this.checkForUserPredictions();
    }

    checkForUserPredictions = async () => {
        this.setState({ loading: true })
        let searchParams = JSON.stringify({
            user: await AsyncStorage.getItem('id'),
            category: this.state.info.category
        })
        try {
            let response = await fetch(`https://oscars-picks-api.herokuapp.com/predictions/${searchParams}`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            let res = await response.json();
            if (res.length !== 0) {
                this.setState({
                    info: res[0],
                    myPredictions: res[0].selections,
                    userHasPredicted: true,
                    status: 'Got your previous predictions!'
                })
            } else {
                this.setState({
                    status: 'Predictions not yet completed'
                })
            }
            this.isReadOnly();
            this.setState({ loading: false })
        } catch (err) {
            console.log(err)
        }
    }

    updatePredictions = async () => {
        if (!this.isReadOnly()) {
            this.setState({ loading: true, status: 'Loading...' });
            try {
                let response = await fetch(`https://oscars-picks-api.herokuapp.com/predictions/${this.state.info._id}`, {
                    method: 'PUT',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    }, body: JSON.stringify({
                        category: this.state.info.category,
                        user: await AsyncStorage.getItem('id'),
                        selections: this.state.myPredictions
                    })
                });
                let res = await response;
                if (res) {
                    this.setState({
                        loading: false,
                        status: 'Updated!'
                    })
                    this.isReadOnly();
                } else {
                    console.log('There was a problem updating the prediction')
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    savePredictions = async () => {
        if (!this.isReadOnly()) {
            this.setState({ loading: true, status: 'Loading...' })
            try {
                let response = await fetch('https://oscars-picks-api.herokuapp.com/predictions', {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user: await AsyncStorage.getItem('id'),
                        selections: this.state.myPredictions,
                        category: this.state.info.category
                    })
                })
                let res = await response.json();
                if (res.errors) {
                    this.setState({ errors: res.errors })
                } else {
                    this.setState({ userHasPredicted: true, status: 'Saved!' })
                    this.isReadOnly();
                }
                this.setState({ loading: false })
            } catch (err) {
                console.log(err)
            }
        }
    }

    pickColor() {
        switch (this.state.status) {
            case 'Loading...':
                return '#e0d100';
            case 'Updated!':
            case 'Saved!':
            case 'Got your previous predictions!':
            case 'Oscars have started!':
                return '#39f52c';
            case 'Predictions not yet completed':
            case 'You have unsaved changes':
                return '#ff2e2e';

        }
    }

    isReadOnly() {
        let oscars = new Date(2020, 1, 9, 19, 0, 0, 0)
        let now = new Date();
        if (now >= oscars) {
            this.setState({
                readOnly: true,
                status: 'Oscars have started!'
            })
            return true
        } else {
            this.setState({
                readOnly: false
            })
            return false
        }
    }

    renderItem = ({ item, index, drag, isActive }) => {
        return (
            <View style={{ flex: 1, alignItems: 'center' }}>
                <TouchableOpacity style={{ height: 100, width: '97%', backgroundColor: 'white', alignItems: 'center', borderRadius: 10, marginBottom: 10, flexDirection: 'row' }} onLongPress={() => !this.state.readOnly ? drag() : null} activeOpacity={0.9}>
                    <Image source={pics[item.primary] || pics[item.secondary]} style={{ marginLeft: 10, height: 75, width: 47 }} />
                    <View style={{width: '100%'}}>
                        <Text style={{ paddingLeft: 10, marginRight: 20 }}>{item.primary}</Text>
                        <Text style={{ paddingLeft: 10, marginRight: 20, width: '80%' }}>{item.secondary}</Text>
                    </View>
                </TouchableOpacity>
            </View>

        )
    }

    render() {
        return (
            <View style={{ backgroundColor: '#262626', flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 30, paddingLeft: 15, paddingRight: 15, paddingBottom: 10, paddingTop: 30 }}>{this.state.info.category}</Text>
                <Text style={{ color: 'white', fontSize: 20, paddingLeft: 15, paddingRight: 15, paddingBottom: 10 }}>Drag and drop nominees in order of most likely to least likely, top to bottom</Text>

                {this.state.loading && (
                    <View style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                        <ActivityIndicator
                            size='large'
                            color='#e0d100'
                        />
                    </View>
                )}

                {!this.state.loading && (
                    <DraggableFlatList
                        data={this.state.myPredictions}
                        renderItem={this.renderItem}
                        keyExtractor={(item, index) => item.primary}
                        onDragBegin={() => this.setState({ scrollEnabled: false })}
                        onDragEnd={({ data }) => { this.setState({ myPredictions: data, scrollEnabled: true, status: 'You have unsaved changes' }) }}

                    />
                )}
                <View style={{ height: 75, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 20, paddingLeft: 20 }}>
                    {!this.state.loading && (
                        <Button
                            icon={<FontAwesomeIcon icon={faArrowLeft} style={{ color: 'white' }} />}
                            onPress={() => this.props.navigation.goBack()}
                            buttonStyle={{
                                width: 60,
                                height: 61,
                                borderRadius: 30,
                                backgroundColor: '#ff2e2e'
                            }}
                            containerStyle={{
                                width: 60,
                                height: 61,
                                borderRadius: 30
                            }}
                            titleStyle={{
                                fontSize: 30
                            }}
                        />
                    )}
                    <View style={{ display: 'flex', width: this.state.loading ? '100%' : null, alignItems: 'center' }}>
                        <Text style={{ color: this.pickColor() }}>{this.state.status}</Text>
                    </View>
                    {!this.state.loading && (
                        <Button
                            icon={<FontAwesomeIcon icon={faSave} style={{ color: 'white' }} />}
                            onPress={() => this.state.userHasPredicted ? this.updatePredictions() : this.savePredictions()}
                            buttonStyle={{
                                width: 60,
                                height: 61,
                                borderRadius: 30,
                                backgroundColor: '#39f52c'
                            }}
                            disabled={this.state.readOnly}
                            containerStyle={{
                                width: 60,
                                height: 61,
                                borderRadius: 30
                            }}
                            titleStyle={{
                                fontSize: 30
                            }}
                        />
                    )}
                </View>
            </View>
        )
    }
}

export default PredictionPicker