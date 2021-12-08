def get_spam_folder(mailbox) -> str:
    for f in mailbox.folder.list():
        if (f.get('name').find("Spam") != -1 or f.get('name').find("spam") != -1 or f.get('name').find("Junk") != -1 or f.get('name').find("junk") != -1):
            return f.get('name')
    return None
