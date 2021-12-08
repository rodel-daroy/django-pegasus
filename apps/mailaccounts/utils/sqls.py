schedule_sql_template = '''
SELECT
    ca.id AS campaign_id,
    ce.id AS email_id,
    ce.email_type,
    ce.email_subject,
    ce.email_body,
    ce.email_order,
    ce.wait_days,
    ce.is_deleted,
    cr.id AS recipient_id,
    cr.email AS recipient_email,
    cr.full_name AS recipient_name,
    cr.attending_email_id AS from_email_id,
    cr.replacement,
    cr.leads,
    cr.recipient_status,
    cr.is_unsubscribe,
    cr.is_delete,
    ceo.id AS emailoutbox_id,
    ceo.status,
    ceo.sent_date,
    ceo.sent_time
FROM
    campaign_campaign ca
    INNER JOIN
        campaign_emails ce
        ON ce.campaign_id = ca.id
            AND ca.id = %s
            AND ca.campaign_status = TRUE
            AND ca.is_deleted = FALSE
            AND ca.is_draft = FALSE
    INNER JOIN
        campaign_recipient cr
        ON ce.campaign_id = cr.campaign_id
            AND ce.is_deleted = FALSE
            AND cr.recipient_status = TRUE
            AND cr.is_delete = FALSE
            AND cr.attending_email_id = %s
    LEFT JOIN
        campaign_emailoutbox ceo
        ON ce.campaign_id = ceo.campaign_id
            AND ce.id = ceo.email_id
            AND cr.id = ceo.recipient_id
            AND ceo.status <> 2

'''
