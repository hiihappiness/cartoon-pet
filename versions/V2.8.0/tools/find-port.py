"""给「启动游戏.bat」挑一个空闲端口：8080 起，最多试到 8099。"""
import socket


def main():
    for port in range(8080, 8100):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(("127.0.0.1", port))
            s.close()
            print(port)
            return
        except OSError:
            s.close()
    print(8080)


if __name__ == "__main__":
    main()
