export default defineEventHandler(async (event) => {
  const formData = await readFormData(event);
  const username = formData.get('username');
  const isSpectator = formData.get('is-spectator')?.toString() === 'on';
  console.log('username', username?.toString());
  console.log('spectator', isSpectator?.toString());
  if (username && username.toString().length > 12) {
    setResponseStatus(event, 400);
    return 'username too long';
  }
  return sendRedirect(event, `/room?username=${username}&isSpectator=${isSpectator}`, 201);


});