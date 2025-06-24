import { manifestCalculator, CalculatorIntent } from './calculator';
import { getMockUserOwnedState } from './test-utils';

const demonstrateMomentaryCalculator = async (): Promise<void> => {
  const userState = getMockUserOwnedState();
  
  await userState.write('/preferences/calculator', {
    precision: 2,
    roundingMode: 'round'
  });

  const calculationIntent: CalculatorIntent = {
    operation: 'divide',
    operands: [22, 7]
  };

  const calculator = await manifestCalculator(calculationIntent);
  console.log(`Calculator manifested: ${calculator.id}`);
  console.log(`Purpose: ${calculator.purpose}`);
  console.log(`Active: ${calculator.isActive()}`);

  const result = await calculator.execute(userState);
  console.log(`Calculation result: ${result.value}`);
  
  console.log(`Before dissolution - Active: ${calculator.isActive()}`);
  console.log(`Has residual data: ${calculator.hasResidualData()}`);
  
  await calculator.dissolve();
  
  console.log(`After dissolution - Active: ${calculator.isActive()}`);
  console.log(`Has residual data: ${calculator.hasResidualData()}`);
  console.log(`Sensitive data cleared:`, calculator.getSensitiveData());
};

const demonstrateAutoDissolve = async (): Promise<void> => {
  console.log('\nTesting auto-dissolution...');
  
  const calculator = await manifestCalculator(
    { operation: 'add', operands: [1, 1] },
    { maxLifetime: 1000 }
  );
  
  console.log(`Calculator active: ${calculator.isActive()}`);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`After 1.5s - Calculator active: ${calculator.isActive()}`);
      resolve();
    }, 1500);
  });
};

const demonstrateErrorHandling = async (): Promise<void> => {
  console.log('\nTesting error handling...');
  
  const calculator = await manifestCalculator({
    operation: 'divide',
    operands: [10, 0]
  });
  
  const result = await calculator.execute(getMockUserOwnedState());
  console.log(`Division by zero result:`, result);
  
  await calculator.dissolve();
  console.log('Calculator safely dissolved after error');
};

const runDemo = async (): Promise<void> => {
  console.log('=== Momentary Calculator Demo ===');
  
  await demonstrateMomentaryCalculator();
  await demonstrateAutoDissolve();
  await demonstrateErrorHandling();
  
  console.log('\n=== Demo Complete ===');
  console.log('All calculators manifested, executed, and dissolved');
  console.log('No persistent data remains');
};

if (require.main === module) {
  runDemo().catch(console.error);
}