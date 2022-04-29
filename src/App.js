import { useEffect, useState } from "react";
import {
  VStack,
  useDisclosure,
  Button,
  Text,
  HStack,
  Select,
  Input,
  Box
} from "@chakra-ui/react";
import SelectWalletModal from "./Modal";
import { useWeb3React } from "@web3-react/core";
import { CheckCircleIcon, WarningIcon } from "@chakra-ui/icons";
import { Tooltip } from "@chakra-ui/react";
import { networkParams } from "./networks";
import { connectors } from "./connectors";
import { toHex, truncateAddress } from "./utils";

export default function Home() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    library,
    chainId,
    account,
    activate,
    deactivate,
    active
  } = useWeb3React();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [network, setNetwork] = useState(undefined);
  const [message, setMessage] = useState("");
  const [signedMessage, setSignedMessage] = useState("");
  const [verified, setVerified] = useState();

  const handleNetwork = (e) => {
    const id = e.target.value;
    setNetwork(Number(id));
  };

  const handleInput = (e) => {
    const msg = e.target.value;
    setMessage(msg);
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(network) }]
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[toHex(network)]]
          });
        } catch (error) {
          setError(error);
        }
      }
    }
  };

  const signMessage = async () => {
    if (!library) return;
    try {
      const signature = await library.provider.request({
        method: "personal_sign",
        params: [message, account]
      });
      setSignedMessage(message);
      setSignature(signature);
    } catch (error) {
      setError(error);
    }
  };

  const verifyMessage = async () => {
    if (!library) return;
    try {
      const verify = await library.provider.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature]
      });
      setVerified(verify === account.toLowerCase());
    } catch (error) {
      setError(error);
    }
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
    setNetwork("");
    setMessage("");
    setSignature("");
    setVerified(undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };


  // this function should take the address and depending on address (later dep on the block)
  //first print the address 
  //change the bg of the page depending on combined ascii value i.e 0>1 : black, 1>30 pink etc (will need to know max val: no of chars * max ascii value)
  //ENTRY POINT
  function generateArt() {
    console.log(account);
    // form the bg gradient
    let asciiValuesArray = calculateAsciiValuesOfAddress(account);
     
    let gradStr = generateBgGradientString(asciiValuesArray)
    console.log("GRAD str: " + gradStr)
    return gradStr;
  }

  function generateBgGradientString(asciiValueArray) {
    
    let col1 = ""
    let col2 = ""
    let col3 = ""

    if(asciiValueArray[0] < 500 ) {
       col1 = "gray"
       col2 = "orange"
       cole3 = "green"
    } else if(asciiValueArray[0] < 700 ) {
       col1 = "yellow"
       col2 = "red"
       col3 = "pink"
    } else if(asciiValueArray[0] < 900 ) {
       col1 = "pink"
       col2 = " red"
       col3 = "blue"
    } else if(asciiValueArray[0] < 1000 ) {
       col1 = "red"
       col2 = "yellow"
       col3 = "gray"
    } else if(asciiValueArray[0] < 1100 ) {
       col1 = "red"
       col2 = "orange"
       col3 = "yellow"
    } else if(asciiValueArray[0] > 1400 ) {
      col1 = "orange"
      col2 = "purple"
      col3 = "pink"
    }


    const gradType1 = "radial"
    const gradType2 = "linear"

    const shade1 = "300"
    const shade2 = "400"
    const shade3 = "200"

    //bgGradient="radial(gray.300, yellow.400, pink.200)"
    return gradType1 + "(" + col1 + "." + shade1 + "," + col2 + "." + shade2 + "," + col3 + "." + shade3 + ")"

  }

  //0x7335cBb8fe37c51a6B781A5084C7bFB8fE72e208
  // 3 params - split into 3 even parts - 14 chars each - ranges of 600
  function calculateAsciiValuesOfAddress(account) {
    console.log('Enter Ascii:' + account)
    let asciiSumP1 = 0;
    let asciiSumP2 = 0;
    let asciiSumP3 = 0;

    //"\n".charCodeAt(0);
    if(typeof account !== 'undefined') {
      console.log('defined account')
      console.log("Account Length: " + account.length)

      var accountCharacterArray = account.split("")
      for(let i=0; i <account.length ;i++ ) {
        if(i < 13){
          asciiSumP1 += accountCharacterArray[i].charCodeAt(0);
        } else if (i > 13 && i <27) {
          asciiSumP2 += accountCharacterArray[i].charCodeAt(0);
        } else if ( i > 27) {
          asciiSumP3+=accountCharacterArray[i].charCodeAt(0);
        }
      }
      console.log("Ascii Sum 1: " + asciiSumP1);
      console.log("Ascii Sum 2: " + asciiSumP2);
      console.log("Ascii Sum 3: " + asciiSumP3);

      return [asciiSumP1,asciiSumP2,asciiSumP3]
    }
  }

  const genBgGradient = () => {
    
    // generateBgGradientString();
    console.log("YOOOOOOOOOOOO")
    console.log(account)

    return generateArt();
  } 

  useEffect(() => {
    const provider = window.localStorage.getItem("provider");
    if (provider){
      activate(connectors[provider]);
      console.log("PROVIDER ")    
    }
  }, []);

  return (
    <Box
    bgGradient={active ? genBgGradient : ""}
    >

      <VStack justifyContent="center" alignItems="center" h="100vh">
        <VStack marginBottom="10px" justifyContent="center">
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["0.5em", "1em", "2em", "3em"]}
            fontWeight="600"
          >
            Ugandan Web3 Has Arrived with
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Afropocene
          </Text>
          <Text
            margin="0"
            lineHeight="1.15"
            fontSize={["1.5em", "2em", "3em", "4em"]}
            fontWeight="600"
            sx={{
              background: "linear-gradient(90deg, #1652f0 0%, #b9cbfb 70.35%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}
          >
            Connect your wallet to Generate Background!
          </Text>
        </VStack>
        <HStack>
          {!active ? (
            <Button onClick={onOpen}>Connect Wallet</Button>
          ) : (
            <Button onClick={disconnect}>Disconnect</Button>
          )}
        </HStack>
        <VStack justifyContent="center" alignItems="center" padding="10px 0">
          <HStack>
            <Text>{`Connection Status: `}</Text>
            {active ? (
              <CheckCircleIcon color="green" />
            ) : (
              <WarningIcon color="#cd5700" />
            )}
          </HStack>

          {/* <Tooltip label={account} placement="right" onLoad={generateArt(account)}> */}
          <Tooltip label={account} placement="right">
            <Text>{`Account: ${truncateAddress(account)}`}</Text>
            {/* <Text>{`Account: ${account}`}</Text> */}
          </Tooltip>
          {/* <Button onClick={generateArt(account)}>{`Account: ${account}`}</Button> */}
          <Text>{`Network ID: ${chainId ? chainId : "No Network"}`}</Text>
        </VStack>
        {active && (
          <HStack justifyContent="flex-start" alignItems="flex-start">
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={switchNetwork} isDisabled={!network}>
                  Switch Network
                </Button>
                <Select placeholder="Select network" onChange={handleNetwork}>
                  <option value="3">Ropsten</option>
                  <option value="4">Rinkeby</option>
                  <option value="42">Kovan</option>
                  <option value="1666600000">Harmony</option>
                  <option value="42220">Celo</option>
                </Select>
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={signMessage} isDisabled={!message}>
                  Sign Message
                </Button>
                <Input
                  placeholder="Set Message"
                  maxLength={20}
                  onChange={handleInput}
                  w="140px"
                />
                {signature ? (
                  <Tooltip label={signature} placement="bottom">
                    <Text>{`Signature: ${truncateAddress(signature)}`}</Text>
                  </Tooltip>
                ) : null}
              </VStack>
            </Box>
            <Box
              maxW="sm"
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              padding="10px"
            >
              <VStack>
                <Button onClick={verifyMessage} isDisabled={!signature}>
                  Verify Message
                </Button>
                {verified !== undefined ? (
                  verified === true ? (
                    <VStack>
                      <CheckCircleIcon color="green" />
                      <Text>Signature Verified!</Text>
                    </VStack>
                  ) : (
                    <VStack>
                      <WarningIcon color="red" />
                      <Text>Signature Denied!</Text>
                    </VStack>
                  )
                ) : null}
              </VStack>
            </Box>
          </HStack>
        )}
        <Text>{error ? error.message : null}</Text>
      </VStack>
      <SelectWalletModal isOpen={isOpen} closeModal={onClose} />
    </Box>
  );
}
