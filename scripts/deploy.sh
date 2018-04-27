#!/bin/bash
# Nabyl Bennouri - 4/27/2018

# parse arguments
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -network|-n)
    NETWORK="$2"
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

# debug
#echo FUNCTION  = "${FUNCTION}"

# error handling
if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 "$1"
fi

if [ "${NETWORK}" == "" ]
then
  echo "Using local network"
fi

# test call

if [ "${NETWORK}" == "rinkeby" ]
then
  echo "Starting node on Rinkeby ..."
  geth --rinkeby --rpc --rpcapi db,eth,net,web3,personal --unlock="0x0085f8e72391Ce4BB5ce47541C846d059399fA6c"
  echo "Node started"
fi
# clean
echo "Deploying contract"
truffle migrate --reset

