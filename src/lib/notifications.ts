export async function notifyLawyer(title: string, body: string): Promise<boolean> {
  if (!('Notification' in window)) return false;

  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') return false;

  new Notification(title, { body, icon: undefined });
  return true;
}
