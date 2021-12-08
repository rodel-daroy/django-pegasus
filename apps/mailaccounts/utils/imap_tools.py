from imap_tools import MailBox, AND, OR, NOT, H


def get_spam_folder(imap_host: str, username: str, password: str):
    """This method finds out

    Args:
        imap_host (str): IMAP host
        username (str): IMAP username
        password (str): IMAP password

    Returns:
        (str): Returns junk/spam folder name.
    """
    try:
        r = ""
        mailbox = MailBox(imap_host)
        mailbox.login(username, password)
        fm = mailbox.folder_manager_class(mailbox)
        l = fm.list()
        mailbox.logout()
        for ll in l:
            if "\\Junk" in ll["flags"]:
                r = ll["name"]
        return r
    except Exception as e:
        capture_exception(e)
        # print(error)
        return r
