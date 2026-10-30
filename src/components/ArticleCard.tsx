import Link from "next/link";
import { type Article } from "@/lib/data";
import { Icon, type IconName } from "./Icon";
const icons: IconName[] = [
  "briefcase",
  "building",
  "graduate",
  "check",
  "mail",
];
export function ArticleCard({
  article,
  index = 0,
}: {
  article: Article;
  index?: number;
}) {
  return (
    <Link
      className={"article-card article-tone-" + (index % 3)}
      href={"/blog/" + article.slug}
    >
      <div className="article-visual" aria-hidden="true">
        <div className="guide-sheet">
          <span />
          <span />
          <Icon name={icons[index % icons.length]} size={38} />
          <span />
        </div>
        <span className="guide-number">0{index + 1}</span>
        <span className="guide-decoration" />
      </div>
      <div className="article-content">
        <div className="article-meta">
          <span>{article.category}</span>
          <span>
            <Icon name="clock" size={13} />
            {article.readTime}
          </span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <span className="text-link">
          Leer guía <Icon name="arrow" size={17} />
        </span>
      </div>
    </Link>
  );
}
