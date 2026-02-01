// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console2} from "forge-std/Test.sol";
import {AryaBondingCurve} from "../contracts/AryaBondingCurve.sol";

contract MockToken {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    string public name = "Mock Token";
    string public symbol = "MKT";
    uint8 public decimals = 18;
    
    constructor(uint256 _supply) {
        balanceOf[msg.sender] = _supply;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract AryaBondingCurveTest is Test {
    AryaBondingCurve public bondingCurve;
    MockToken public token;
    
    address public user = makeAddr("user");
    address public treasury = makeAddr("treasury");
    
    function setUp() public {
        token = new MockToken(1000000 ether);
        bondingCurve = new AryaBondingCurve(address(token), treasury);
        token.transfer(user, 10000 ether);
        vm.deal(user, 100 ether);
    }
    
    function testInitialState() public view {
        assertEq(bondingCurve.token(), address(token));
        assertEq(bondingCurve.treasury(), treasury);
    }
    
    function testGetPriceForOneETH() public view {
        uint256 price = bondingCurve.getPrice(1 ether);
        assertGt(price, 0);
    }
    
    function testBuyWithETH() public {
        vm.startPrank(user);
        bondingCurve.buy{value: 1 ether}(1 ether);
        assertGt(token.balanceOf(user), 0);
        vm.stopPrank();
    }
    
    function testSellTokens() public {
        vm.startPrank(user);
        bondingCurve.buy{value: 2 ether}(2 ether);
        uint256 userTokens = token.balanceOf(user);
        token.approve(address(bondingCurve), userTokens);
        uint256 expectedEthOut = bondingCurve.getPrice(userTokens);
        bondingCurve.sell(userTokens, expectedEthOut);
        vm.stopPrank();
    }
}
