export const updateGreeting = async (contractInstance) => {
  if (contractInstance) {
    const greeting = await contractInstance.greet();
    return greeting;
  }
};
