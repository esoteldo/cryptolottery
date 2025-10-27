
import { useGetPrices } from '../../context/getPricesContext';
import './styles.css';
import HeroCrypto from "../../assets/images/hero-crypto.jpg";
import {
  EmailIcon,
  EmailShareButton,
  FacebookIcon,
  FacebookShareButton,
  /* FacebookShareCount, */
  GabIcon,
  GabShareButton,
  LinkedinIcon,
  LinkedinShareButton,
  LivejournalIcon,
  LivejournalShareButton,
  MailruIcon,
  MailruShareButton,
  OKIcon,
  OKShareButton,
  RedditIcon,
  RedditShareButton,
  TelegramIcon,
  TelegramShareButton,
  TumblrIcon,
  TumblrShareButton,
  TwitterShareButton,
  ViberIcon,
  ViberShareButton,
  VKIcon,
  VKShareButton,
  WeiboIcon,
  WeiboShareButton,
  WhatsappIcon,
  WhatsappShareButton,
  XIcon,
} from "react-share";

const ShareModal = () => {

    const shareUrl = "https://cryptolottery.app/ref/USER123XYZ";
  const title = "CriptoLottery - Win crypto prizes!";

    const { shareModal,setShareModal } = useGetPrices();

  return (
    <>
         Share Modal 
    <div id="success-modal"  className={shareModal?"fixed inset-0 modalShow flex items-center justify-center z-50 ":"hidden"}  >
        <div className="glass-card rounded-2xl p-6 m-4 max-w-sm w-full text-center">
                           {/* <div className="text-6xl mb-4">🎉</div> */}
                           <h3 className="text-xl font-bold mb-10 orbitron">Share Referal Link</h3>
                               <div className="Demo__container">
                     <div className="Demo__some-network">
                       <FacebookShareButton
                         url={shareUrl}
                         className="Demo__some-network__share-button"
                       >
                         <FacebookIcon size={32} round />
                       </FacebookShareButton>

                      {/*  <div>
                         <FacebookShareCount
                           url={shareUrl}
                           className="Demo__some-network__share-count"
                         >
                           {(count) => count}
                         </FacebookShareCount>
                       </div> */}
                     </div>


                     <div className="Demo__some-network">
                       <TwitterShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <XIcon size={32} round />
                       </TwitterShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <TelegramShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <TelegramIcon size={32} round />
                       </TelegramShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <WhatsappShareButton
                         url={shareUrl}
                         title={title}

                         separator=":: "
                         className="Demo__some-network__share-button"
                       >
                         <WhatsappIcon size={32} round />
                       </WhatsappShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <LinkedinShareButton
                         url={shareUrl}
                         className="Demo__some-network__share-button"
                       >
                         <LinkedinIcon size={32} round />
                       </LinkedinShareButton>
                     </div>


                     <div className="Demo__some-network">
                       <VKShareButton
                         url={shareUrl}
                         image={HeroCrypto}
                         className="Demo__some-network__share-button"
                       >
                         <VKIcon size={32} round />
                       </VKShareButton>

                     </div>

                     <div className="Demo__some-network">
                       <OKShareButton
                         url={shareUrl}
                         className="Demo__some-network__share-button"
                       >
                         <OKIcon size={32} round />
                       </OKShareButton>

                     </div>

                     <div className="Demo__some-network">
                       <RedditShareButton
                         url={shareUrl}
                         title={title}
                         windowWidth={660}
                         windowHeight={460}
                         className="Demo__some-network__share-button"
                       >
                         <RedditIcon size={32} round />
                       </RedditShareButton>

                       {/* <div>
                         <RedditShareCount
                           url={shareUrl}
                           className="Demo__some-network__share-count"
                         />
                       </div> */}
                     </div>

                     <div className="Demo__some-network">
                       <GabShareButton
                         url={shareUrl}
                         title={title}
                         windowWidth={660}
                         windowHeight={640}
                         className="Demo__some-network__share-button"
                       >
                         <GabIcon size={32} round />
                       </GabShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <TumblrShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <TumblrIcon size={32} round />
                       </TumblrShareButton>

                       {/* <div>
                         <p className="Demo__some-network__share-count">
                           Tumblr
                         </p>
                       </div>  */}
                     </div>

                     <div className="Demo__some-network">
                       <LivejournalShareButton
                         url={shareUrl}
                         title={title}
                         description={shareUrl}
                         className="Demo__some-network__share-button"
                       >
                         <LivejournalIcon size={32} round />
                       </LivejournalShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <MailruShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <MailruIcon size={32} round />
                       </MailruShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <EmailShareButton
                         url={shareUrl}
                         subject={title}
                         body="body"
                         className="Demo__some-network__share-button"
                       >
                         <EmailIcon size={32} round />
                       </EmailShareButton>
                     </div>

                     <div className="Demo__some-network">
                       <ViberShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <ViberIcon size={32} round />
                       </ViberShareButton>
                     </div>



                     <div className="Demo__some-network">
                       <WeiboShareButton
                         url={shareUrl}
                         title={title}
                         className="Demo__some-network__share-button"
                       >
                         <WeiboIcon size={32} round />
                       </WeiboShareButton>
                     </div>


                     
    
              </div>
            <button onClick={()=>{setShareModal(false);}} className="buy-button mt-10 w-full py-3 rounded-lg text-white font-bold">
                Continue
            </button>
        </div>
    </div>
    </>
  )
}

export default ShareModal