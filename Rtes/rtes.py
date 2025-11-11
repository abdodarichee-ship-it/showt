#!/usr/bin/env python3
"""
deesn.py
فحص أعمق: مسح مجموعة بورتات أوسع، فحص الـ SSL، جلب صفحة index أولية،
وطباعة النتائج تدريجيا.
Usage: python3 deesn.py <url>
"""
import sys
import socket
import urllib.request
import ssl
import time

def print_flush(*args, **kwargs):
    print(*args, **kwargs, flush=True)

def extract_host(url):
    try:
        return urllib.request.urlparse(url).hostname
    except:
        return None

def port_scan_range(host, start=1, end=1024, timeout=0.5, max_checks=200):
    print_flush(f"[+] Starting deeper port scan on {host} (ports {start}-{end}). This may take a while.")
    open_ports = []
    checked = 0
    for p in range(start, end+1):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(timeout)
            res = s.connect_ex((host, p))
            if res == 0:
                print_flush(f"Port {p}: open")
                open_ports.append(p)
            # عدّاد لتجنب طول المدة لو أحببت إيقاف مبكر
            checked += 1
            s.close()
            if checked >= max_checks:
                print_flush("[*] Reached max_checks limit for speed. Stop early to save time.")
                break
        except Exception as e:
            print_flush(f"Port {p}: err {e}")
    return open_ports

def fetch_index(url, timeout=8):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'DeepScanner/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            content = r.read(4096)
            print_flush("[+] Fetched first 4KB of page:")
            print_flush(content[:1000])
            return True
    except Exception as e:
        print_flush(f"[-] Could not fetch index: {e}")
        return False

def check_ssl(host):
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.socket(), server_hostname=host) as s:
            s.settimeout(5.0)
            s.connect((host, 443))
            cert = s.getpeercert()
            print_flush("[+] SSL certificate found. Subject:")
            print_flush(cert.get('subject'))
            return cert
    except Exception as e:
        print_flush(f"[-] SSL check failed: {e}")
        return None

def main():
    if len(sys.argv) < 2:
        print_flush("Usage: python3 deesn.py <url>")
        sys.exit(1)
    url = sys.argv[1]
    host = extract_host(url)
    if not host:
        print_flush("[-] Could not parse host from url.")
        sys.exit(1)

    print_flush(f"Deep scan for {host} starting at {time.ctime()}")
    ip = None
    try:
        ip = socket.gethostbyname(host)
        print_flush(f"[+] Resolved IP: {ip}")
    except Exception as e:
        print_flush(f"[-] DNS resolution failed: {e}")

    # SSL check
    check_ssl(host)

    # Fetch index page
    fetch_index(url)

    # Deeper port scan (but limited to speed)
    port_scan_range(host, start=1, end=2000, timeout=0.3, max_checks=400)

    print_flush("Deep scan finished.")

if __name__ == '__main__':
    main()
