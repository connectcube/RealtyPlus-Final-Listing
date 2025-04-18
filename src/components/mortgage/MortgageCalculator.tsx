import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Header from "../layout/Header";
import Footer from "../layout/Footer";

const MortgageCalculator = () => {
  const [propertyPrice, setPropertyPrice] = useState(500000);
  const [downPayment, setDownPayment] = useState(100000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanTerm, setLoanTerm] = useState(25);
  const [interestRate, setInterestRate] = useState(5);
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [totalInterest, setTotalInterest] = useState(0);

  // Calculate mortgage details
  useEffect(() => {
    // Ensure down payment is not more than property price
    const validDownPayment = Math.min(downPayment, propertyPrice);

    const principal = propertyPrice - validDownPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;

    if (monthlyRate === 0) {
      setMonthlyPayment(principal / numberOfPayments);
      setTotalPayment(principal);
      setTotalInterest(0);
    } else {
      const x = Math.pow(1 + monthlyRate, numberOfPayments);
      const monthly = (principal * x * monthlyRate) / (x - 1);

      setMonthlyPayment(monthly);
      setTotalPayment(monthly * numberOfPayments);
      setTotalInterest(monthly * numberOfPayments - principal);
    }
  }, [propertyPrice, downPayment, loanTerm, interestRate]);

  // Update down payment percentage when down payment changes
  useEffect(() => {
    const percent = (downPayment / propertyPrice) * 100;
    setDownPaymentPercent(parseFloat(percent.toFixed(1)));
  }, [downPayment, propertyPrice]);

  // Update down payment when percentage changes
  const handleDownPaymentPercentChange = (value: number[]) => {
    const percent = value[0];
    setDownPaymentPercent(percent);
    setDownPayment(Math.round((percent / 100) * propertyPrice));
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return `K${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Mortgage Calculator
        </h1>

        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="calculator">Calculator</TabsTrigger>
              <TabsTrigger value="amortization">
                Amortization Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="propertyPrice">
                      Property Price: {formatCurrency(propertyPrice)}
                    </Label>
                    <Input
                      id="propertyPrice"
                      type="number"
                      value={propertyPrice}
                      onChange={(e) => setPropertyPrice(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="downPayment">
                      Down Payment: {formatCurrency(downPayment)} (
                      {downPaymentPercent}%)
                    </Label>
                    <Input
                      id="downPayment"
                      type="number"
                      value={downPayment}
                      onChange={(e) => setDownPayment(Number(e.target.value))}
                      className="w-full"
                    />
                    <Slider
                      defaultValue={[20]}
                      value={[downPaymentPercent]}
                      max={100}
                      step={1}
                      onValueChange={handleDownPaymentPercentChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loanTerm">
                      Loan Term: {loanTerm} years
                    </Label>
                    <Input
                      id="loanTerm"
                      type="number"
                      value={loanTerm}
                      onChange={(e) => setLoanTerm(Number(e.target.value))}
                      className="w-full"
                    />
                    <Slider
                      defaultValue={[25]}
                      value={[loanTerm]}
                      min={5}
                      max={30}
                      step={1}
                      onValueChange={(value) => setLoanTerm(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interestRate">
                      Interest Rate: {interestRate}%
                    </Label>
                    <Input
                      id="interestRate"
                      type="number"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full"
                      step="0.1"
                    />
                    <Slider
                      defaultValue={[5]}
                      value={[interestRate]}
                      min={0}
                      max={20}
                      step={0.1}
                      onValueChange={(value) => setInterestRate(value[0])}
                    />
                  </div>
                </div>

                <div>
                  <Card className="bg-white shadow-lg">
                    <CardHeader className="bg-realtyplus text-white">
                      <CardTitle className="text-xl">
                        Mortgage Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-sm text-gray-500">
                            Monthly Payment
                          </h3>
                          <p className="text-3xl font-bold text-realtyplus">
                            {formatCurrency(monthlyPayment)}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm text-gray-500">
                              Loan Amount
                            </h3>
                            <p className="text-lg font-semibold">
                              {formatCurrency(propertyPrice - downPayment)}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500">
                              Down Payment
                            </h3>
                            <p className="text-lg font-semibold">
                              {formatCurrency(downPayment)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h3 className="text-sm text-gray-500">
                              Total Interest
                            </h3>
                            <p className="text-lg font-semibold">
                              {formatCurrency(totalInterest)}
                            </p>
                          </div>
                          <div>
                            <h3 className="text-sm text-gray-500">
                              Total Payment
                            </h3>
                            <p className="text-lg font-semibold">
                              {formatCurrency(totalPayment)}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-realtyplus h-2.5 rounded-full"
                              style={{ width: `${downPaymentPercent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Down Payment: {downPaymentPercent}%</span>
                            <span>
                              Loan: {(100 - downPaymentPercent).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mt-6 space-y-4">
                    <Button className="w-full bg-realtyplus hover:bg-realtyplus-dark">
                      <a href="https://zambianhomeloans.com/" target="_blank">
                        Get Pre-Approved
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full">
                      <a
                        href="https://zambianhomeloans.com/contact-us/"
                        target="_blank"
                      >
                        Talk to a Mortgage Advisor
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="amortization">
              <Card>
                <CardHeader>
                  <CardTitle>Amortization Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Amortization schedule feature coming soon!
                    </p>
                    <p className="text-gray-500 mt-2">
                      This will show a detailed breakdown of your payments over
                      time.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-12 bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              Mortgage Calculator Tips
            </h2>
            <ul className="space-y-2 list-disc pl-5">
              <li>
                A higher down payment typically results in lower monthly
                payments.
              </li>
              <li>
                Shorter loan terms usually have higher monthly payments but
                lower total interest.
              </li>
              <li>
                Interest rates can significantly impact your monthly payment
                amount.
              </li>
              <li>
                Consider additional costs like property taxes, insurance, and
                maintenance.
              </li>
              <li>
                This calculator provides estimates. Contact a mortgage
                professional for personalized advice.
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MortgageCalculator;
