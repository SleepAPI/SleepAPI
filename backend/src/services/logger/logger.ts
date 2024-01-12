class LoggerImpl {
  public log(message: unknown) {
    return console.log('⚡️[log]: ' + message);
  }

  public info(message: unknown) {
    return console.info('⚡️[info]: ' + message);
  }

  public warn(message: unknown) {
    return console.warn('⚡️[warn]: ' + message);
  }

  public error(message: unknown) {
    return console.error('⚡️[error]: ' + message);
  }

  public debug(message: unknown) {
    return console.debug('⚡️[debug]: ' + message);
  }
}

export const Logger = new LoggerImpl();
