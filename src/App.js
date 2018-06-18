import React, { Component } from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import Countdown from 'react-countdown-now';
import {WalletConnector, WebConnector} from 'walletconnect';
import ReactCountdownClock from 'react-countdown-clock';
import Loader from 'react-loader-spinner'
import cc from 'cryptocompare';
import {convertUNIXTimeToString, createData} from './business/Helpers';
import {
  Button, 
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Icon,
  Tooltip
} from '@material-ui/core';
import { createMuiTheme } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import { withStyles } from '@material-ui/core/styles';
import BigNumber from 'bignumber.js';

const LotteryTime = 30;
class App extends Component {
  

  constructor(props) {
    super(props);

    this.state = {
      account: 0x0,
      manager: '',
      players: 0,
      balance: '',
      value: '',
      message: '',
      time: LotteryTime,
      winner: '',
      price: 0,
      nowallet: false,
      snackbar: false,
      estimateTooltip: false,
      playTooltip: false,
      spinner: false,
      history: []
    };

    this.pickAWinner = this.pickAWinner.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.estimateGas = this.estimateGas.bind(this);
    this.lotteryInstance = null;
  }

  refreshParams() {
    var self = this;
    var my_account;

    return web3.eth.getCoinbase()
    .then( (account) => {
      my_account = account;
      return self.lotteryInstance.getNumberOfParticipants({
        from: my_account
      })
    })
    .then( (number) => {
      var players = number.toNumber();
      console.log(`Players: ${players}`);
      self.setState({ players});
      return web3.eth.getBalance(self.lotteryInstance.address)
    })
    .then( (balance) => {
      console.log(`Balance: ${balance}`);
      self.setState({ balance});
      return self.lotteryInstance.getHistoryCount({
        from: my_account
      })
    })
    .then((count) => {
      var newHistory;
      for (var index = 0; index < count; index++) {
        
        web3.eth.getHistory(index)
        .then((item) => {
          newHistory.push(
            createData(
            convertUNIXTimeToString(item.time), 
            item.winner, 
            item.pot
          ));
          if (newHistory.length == count) {
            this.setState({history: newHistory});
          }
        })        
      }
    });
  }

  componentDidMount() {   
    var self = this;

    // Get Ethereum price
    cc.price('BTC', ['USD', 'EUR'])
    .then(prices => {
      console.log(prices)
      self.setState({price: prices.USD});
      // -> { USD: 1100.24, EUR: 1039.63 }
    })
    .catch(console.error);

    web3.eth.getCoinbase((account) => {
      self.setState({ account })
      lottery.deployed().then((lotteryInstance) => {
        self.lotteryInstance = lotteryInstance
        self.watchEvents();
        self.lotteryInstance.manager()
        .then((manager)=>{
          self.setState({ manager }); 
          self.setState({time: LotteryTime});
          self.refreshParams();
        })
      })
    })
  }

  watchEvents() {
    // TODO: trigger event when vote is counted, not when component renders
    var drawEvent = this.lotteryInstance.drawEvent();

    drawEvent.watch((error, event) => {
      this.setState({ winner: false })
    })
  }

  estimateGas() {
    this.setState({ value: "0.001"});
    var self = this;
    web3.eth.getCoinbase()
    .then( (account) => {
      self.setState({ 
        message: 'Waiting on transaction success...',
        snackbar: true
      });
      self.lotteryInstance.enterLottery.estimateGas({
        from: account,
        value: web3.utils.toWei(self.state.value, 'ether')
      })
      .then(function(result) {
        self.setState({ 
          message: `Estimated Gas: ${result}`,
          snackbar: true
        })
      });
    }) 
  }

  onSubmit(event) {
    this.setState({ 
      value: "0.001",
      spinner: true
    });
    var self = this;
    web3.eth.getCoinbase()
    .then( (account) => {
      self.setState({ 
        message: 'Waiting on transaction success...',
        snackbar: true
      });
      if(account == null) {
        self.setState({ 
          message: 'Please make sure you have the Metamask Chrome extension installed and you are signed in to an account.',
          snackbar: true
        });
      } else {     
        self.lotteryInstance.enterLottery({
          from: account,
          value: web3.utils.toWei(self.state.value, 'ether')
        }).then( (result) => {
          self.refreshParams();
          self.setState({ 
            message: 'You have been entered!',
            spinner: false,
            snackbar: true
          });
        })
      }
    })
  };

  pickAWinner = () => {
    var self = this;

    web3.eth.getCoinbase()
    .then( (account) => {
      if (this.state.players < 2) {
        this.setState({ 
          message: 'Extending the drawing for another hour',
          snackbar: true
         });
        console.log("Before", self.state.time, LotteryTime);
        this.setState({time: (self.state.time === LotteryTime) ? self.state.time + 1 : self.state.time - 1 });
        console.log("After", self.state.time, LotteryTime);
        this.refreshParams();
        return;
      }
  
      self.setState({
         message: 'Waiting on Winner to be picked...',
         snackbar: true
         });
         self.lotteryInstance.pickWinner({
        from: this.lotteryInstance.address,
        gas: 70000
      }).then((winner) => {
        console.log("Winner", winner);
        self.refreshParams();
        self.setState({
           message: 'A winner has been picked!',
           snackbar: true
        });
      }).catch((error) => {
        console.error
      });
    })   
  };
  handleClose = () => {
    this.setState({ snackbar: false });
  };

  handleEstimateTooltipClose = () => {
    this.setState({ estimateTooltip: false });
  };

  handleEstimateTooltipOpen = () => {
    this.setState({ estimateTooltip: true });
  };

  handlePlayTooltipClose = () => {
    this.setState({ playTooltip: false });
  };

  handlePlayTooltipOpen = () => {
    this.setState({ playTooltip: true });
  };
  
  renderSpinner() {   
    if (this.state.spinner) {
      return (
        <Loader 
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center'
          }}
          type="ThreeDots"
          color= {theme.palette.primary.main}
          height="100"	
          width="100"
        />   
      )
    }
  }

  renderHistoryTable() {
    const { classes } = this.props;

    return (
      <Paper style={{
        flex: 1,
        marginRight: 40,
        marginLeft: 40,
        borderRadius: 10,
        borderWidth: 2,
        }}>
      <Table className={classes.table}>
        <TableHead style={{backgroundColor: theme.palette.primary.main}}>
          <TableRow>
            <CustomTableCell>Drawing Date and Time</CustomTableCell>
            <CustomTableCell>Winner</CustomTableCell>
            <CustomTableCell>Win (Eth)</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.history.map(n => {
            return (
              <TableRow className={classes.row} key={n.id}>
                <CustomTableCell component="th" scope="row">
                  {n.name}
                </CustomTableCell>
                <CustomTableCell>{n.calories}</CustomTableCell>
                <CustomTableCell>{n.fat}</CustomTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
    )
  }
  renderDialog() {
    return (
        <Dialog
          open={this.state.nowallet}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            {"No Wallet Detected"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              We could not detect an account from Metamask. Please make sure you have the Metamask Chrome extension installed and you are signed in to an account.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              Dismiss
            </Button>
          </DialogActions>
        </Dialog>
    )
  }

  renderSnackBar() {
    const { classes } = this.props;
    const { snackbar } = this.state;

    return (
      <Snackbar
      open={snackbar}
      autoHideDuration={6000}
      onClose={() => {this.setState({ snackbar: false })}}
      ContentProps={{
        'aria-describedby': 'snackbar-fab-message-id',
        className: classes.snackbarContent,
      }}
      message={<span id="snackbar-fab-message-id">{this.state.message}</span>}
      action={
        <Button color="inherit" size="small" onClick={() => {this.setState({ snackbar: false })}}>
          Dismiss
        </Button>
      }
      className={classes.snackbar}
    />
    )
  }

  render() {
    const { classes } = this.props;

    return (
      <div
      className={classes.page}>
     <Grid 
      container
      spacing={16}
      alignItems='stretch'
      direction='column'
      justify='space-between' 
      className={classes.page}
      >
     <AppBar position="static">
        <Toolbar>          
          <Typography 
            variant="title" 
            color="inherit" 
            className={classes.flex}>
            THE DAILY CRYPTO LOTTERY
          </Typography>
          <ReactCountdownClock 
            seconds={this.state.time}
            color="white"
            alpha={0.9}
            size={40}
            onComplete={this.pickAWinner}
          />
        </Toolbar>
      </AppBar>
        <Grid
          container
          spacing={16}
          className={classes.cardsContainer}
          alignItems='flex-start'
          direction='row'
          justify='center'
        >
        <Card className={classes.card}>
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography variant="headline" color="inherit">Balance</Typography>
              <Typography variant="subheading" color="inherit">
              {web3.utils.fromWei(this.state.balance, 'ether')} Ether (${web3.utils.fromWei(this.state.balance, 'ether')*this.state.price})
              </Typography>
            </CardContent>
          </div>
        </Card>
        <Card className={classes.card}>
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography variant="headline" color="inherit">Players</Typography>
              <Typography variant="subheading" color="inherit">
              {this.state.players}
              </Typography>
            </CardContent>
          </div>
        </Card>
        <Card 
          className={classes.card}
          color='red'
        >
          <div className={classes.details}>
            <CardContent className={classes.content}>
              <Typography variant="headline" color="inherit">Ticket Price</Typography>
              <Typography variant="subheading" color="inherit">
              0.001 Ether (${(0.001*this.state.price).toFixed(2)})
              </Typography>
            </CardContent>
          </div>
        </Card>
      </Grid>
      {this.renderHistoryTable()}
      <Grid 
        container
        direction='row'
        alignItems='center'
        justify='flex-end'
        padding={50}
      >
        <Tooltip
          enterDelay={300}
          id="tooltip-controlled"
          leaveDelay={300}
          onClose={this.handleEstimateTooltipClose}
          onOpen={this.handleEstimateTooltipOpen}
          open={this.state.estimateTooltip}
          placement="bottom"
          title="Estimate Gas"
        >
          <IconButton 
            color="secondary" 
            aria-label="Estimate Gas"
            onClick= {this.estimateGas}
          >
            <Icon>search</Icon>
          </IconButton>
        </Tooltip>

        <Tooltip
          enterDelay={300}
          id="tooltip-controlled"
          leaveDelay={300}
          onClose={this.handlePlayTooltipClose}
          onOpen={this.handlePlayTooltipOpen}
          open={this.state.playTooltip}
          placement="bottom"
          title="Enter the lottery"
        >
          <Button 
            variant="fab" 
            color="primary" 
            aria-label="add" 
            className={classes.button}
            onClick= {this.onSubmit}
          >
            <AddIcon />
          </Button>
        </Tooltip>
      </Grid>
        {this.renderSnackBar()}
        {this.renderSpinner()}
      </Grid>
      </div>
    );
  }
}
function Transition(props) {
  return <Slide direction="up" {...props} />;
}

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const styles = theme => ({
  page: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems:'stretch',
    direction:'column',
    justify:'space-between'
  },
  flex: {
    flex: 1
  },
  button: {
    margin: 40,
  },
  cardsContainer:{
    paddingTop: 40,
    paddingBottom: 40,
    paddingLeft: 50,
    paddingRight: 50,
    justifyContent: 'space-between',
  },
  card: {
    width: 250,
    color: 'white',
    backgroundColor: theme.palette.primary.dark,
    borderRadius: 10,
    borderWidth: 2,
  },
  details: {
    flexDirection: 'column',
  },
  content: {
    flex: '1 0 auto',
  },
  table: {
    minWidth: 700,
  },
  row: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
  snackbar: {
    position: 'absolute',
  },
  snackbarContent: {
    width: '100%',
  },
});

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#757ce8',
      main: '#3f50b5',
      dark: '#002884',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});

export default withStyles(styles)(App);
